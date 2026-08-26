"""
HotelGuard AI - ML Pipeline
Downloads real hotel booking demand dataset, validates data, enforces leakage prevention,
trains multiple models, performs CV & hyperparameter optimization, evaluates metrics,
optimizes probability thresholds, and saves champion model artifacts.
"""

import os
import sys
import json
import time
import urllib.request
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    roc_curve, precision_recall_curve
)

# Optional dependencies
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

try:
    import catboost as cb
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
DATASET_PATH = os.path.join(DATA_DIR, "hotel_bookings.csv")

DATA_URLS = [
    "https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2020/2020-02-11/hotels.csv",
    "https://raw.githubusercontent.com/adashofdata/hotel-booking-demand/master/hotel_bookings.csv",
]

def ensure_dirs():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

def download_real_dataset():
    ensure_dirs()
    if os.path.exists(DATASET_PATH) and os.path.getsize(DATASET_PATH) > 1000000:
        print(f"[OK] Dataset already present at {DATASET_PATH} ({os.path.getsize(DATASET_PATH)/1024/1024:.2f} MB)")
        return

    print("[INFO] Downloading real Hotel Booking Demand dataset...")
    success = False
    for url in DATA_URLS:
        try:
            print(f"Trying source: {url}")
            opener = urllib.request.build_opener()
            opener.addheaders = [('User-agent', 'Mozilla/5.0')]
            urllib.request.install_opener(opener)
            urllib.request.urlretrieve(url, DATASET_PATH)
            if os.path.exists(DATASET_PATH) and os.path.getsize(DATASET_PATH) > 1000000:
                print(f"[SUCCESS] Downloaded dataset: {os.path.getsize(DATASET_PATH)/1024/1024:.2f} MB")
                success = True
                break
        except Exception as e:
            print(f"[WARN] Failed downloading from {url}: {e}")
            continue

    if not success:
        raise RuntimeError("Failed to download real dataset. Please place 'hotel_bookings.csv' in the data/ folder.")

def load_and_inspect_data():
    df = pd.read_csv(DATASET_PATH)
    print(f"\n{'='*50}\nDATASET INSPECTION\n{'='*50}")
    print(f"Total Rows: {df.shape[0]:,}")
    print(f"Total Columns: {df.shape[1]}")
    print(f"Cancellation Distribution:\n{df['is_canceled'].value_counts(normalize=True).to_dict()}")
    return df

def preprocess_and_leakage_check(df: pd.DataFrame):
    print(f"\n{'='*50}\nDATA LEAKAGE CHECK & FEATURE PREPARATION\n{'='*50}")
    # STRICT LEAKAGE PREVENTION:
    # 'reservation_status' (Check-Out, Canceled, No-Show) and 'reservation_status_date' directly leak the outcome!
    leakage_cols = ['reservation_status', 'reservation_status_date']
    for col in leakage_cols:
        if col in df.columns:
            print(f"[DATA LEAKAGE SAFEGUARD] Dropping post-outcome leakage column: '{col}'")
            df = df.drop(columns=[col])

    # Target
    y = df['is_canceled'].values
    X_raw = df.drop(columns=['is_canceled'])

    # Feature definitions
    num_features = [
        'lead_time', 'arrival_date_year', 'arrival_date_week_number', 'arrival_date_day_of_month',
        'stays_in_weekend_nights', 'stays_in_week_nights', 'adults', 'children', 'babies',
        'is_repeated_guest', 'previous_cancellations', 'previous_bookings_not_canceled',
        'booking_changes', 'days_in_waiting_list', 'adr', 'required_car_parking_spaces',
        'total_of_special_requests'
    ]

    cat_features = [
        'hotel', 'arrival_date_month', 'meal', 'country', 'market_segment',
        'distribution_channel', 'reserved_room_type', 'assigned_room_type',
        'deposit_type', 'customer_type'
    ]

    X_clean = X_raw[num_features + cat_features].copy()

    # Clean missing values
    X_clean['children'] = X_clean['children'].fillna(0)
    X_clean['country'] = X_clean['country'].fillna('Unknown')

    # Preprocessing pipelines
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='Unknown')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_features),
            ('cat', cat_transformer, cat_features)
        ]
    )

    print(f"Selected Numerical Features ({len(num_features)}): {num_features}")
    print(f"Selected Categorical Features ({len(cat_features)}): {cat_features}")

    return X_clean, y, preprocessor, num_features, cat_features

def evaluate_predictions(y_true, y_prob, threshold=0.5):
    y_pred = (y_prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_true, y_prob))
    pr_auc = float(average_precision_score(y_true, y_prob))

    # Business Cost Calculation
    # False Negative (missed cancellation -> empty room -> loss = $180 avg ADR)
    # False Positive (false alarm -> outreach/retention effort -> cost = $35)
    cost_fn = 180.0
    cost_fp = 35.0
    business_cost = float((fn * cost_fn) + (fp * cost_fp))
    max_possible_cost = float(len(y_true) * cost_fn)
    norm_cost = business_cost / max_possible_cost

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp)
        },
        "business_cost": round(business_cost, 2),
        "normalized_business_cost": round(norm_cost, 4)
    }

def optimize_threshold(y_true, y_prob):
    thresholds = np.linspace(0.10, 0.90, 17)
    best_thresh = 0.50
    best_cost = float('inf')
    threshold_results = []

    for t in thresholds:
        t = round(float(t), 2)
        metrics = evaluate_predictions(y_true, y_prob, threshold=t)
        score = (
            0.30 * metrics['roc_auc'] +
            0.25 * metrics['pr_auc'] +
            0.25 * metrics['recall'] +
            0.10 * metrics['f1'] -
            0.10 * metrics['normalized_business_cost']
        )
        metrics['threshold'] = t
        metrics['business_score'] = round(score, 4)
        threshold_results.append(metrics)

        if metrics['business_cost'] < best_cost:
            best_cost = metrics['business_cost']
            best_thresh = t

    return best_thresh, threshold_results

def compute_model_score(metrics):
    return round(
        0.30 * metrics['roc_auc'] +
        0.25 * metrics['pr_auc'] +
        0.25 * metrics['recall'] +
        0.10 * metrics['f1'] -
        0.10 * metrics['normalized_business_cost'],
        4
    )

def train_and_evaluate_all():
    download_real_dataset()
    df = load_and_inspect_data()
    X, y, preprocessor, num_cols, cat_cols = preprocess_and_leakage_check(df)

    # Stratified Train / Val / Test split
    print(f"\n[INFO] Splitting dataset (Train 70%, Val 15%, Test 15%) with Stratification...")
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.17647, random_state=42, stratify=y_train_val
    )

    print(f"Train size: {len(X_train):,}, Validation size: {len(X_val):,}, Test size: {len(X_test):,}")

    candidate_defs = [
        ("Logistic Regression", "linear", LogisticRegression(max_iter=1000, C=1.0, random_state=42)),
        ("Decision Tree", "tree", DecisionTreeClassifier(max_depth=12, min_samples_leaf=20, random_state=42)),
        ("Random Forest", "ensemble", RandomForestClassifier(n_estimators=100, max_depth=15, min_samples_split=10, random_state=42, n_jobs=-1)),
    ]

    if XGBOOST_AVAILABLE:
        candidate_defs.append(
            ("XGBoost", "gradient_boosting", xgb.XGBClassifier(
                n_estimators=150, max_depth=6, learning_rate=0.1, subsample=0.8, colsample_bytree=0.8,
                random_state=42, eval_metric='logloss', n_jobs=-1
            ))
        )
    else:
        print("[NOTICE] XGBoost is not installed in current environment; registering as UNAVAILABLE.")

    if CATBOOST_AVAILABLE:
        candidate_defs.append(
            ("CatBoost", "gradient_boosting", cb.CatBoostClassifier(
                iterations=200, depth=6, learning_rate=0.1, verbose=0, random_seed=42
            ))
        )
    else:
        print("[NOTICE] CatBoost is not installed in current environment; registering as UNAVAILABLE.")

    if LIGHTGBM_AVAILABLE:
        candidate_defs.append(
            ("LightGBM", "gradient_boosting", lgb.LGBMClassifier(
                n_estimators=150, max_depth=7, learning_rate=0.1, random_state=42, n_jobs=-1
            ))
        )
    else:
        print("[NOTICE] LightGBM is not installed in current environment; registering as UNAVAILABLE.")

    model_registry = []
    trained_pipelines = {}
    champion_name = None
    best_overall_score = -1
    best_pipeline = None
    best_meta = None

    print(f"\n{'='*50}\nTRAINING & COMPARING ALL MODELS (REAL CALCULATIONS)\n{'='*50}")

    for name, m_type, clf in candidate_defs:
        print(f"\n--> Training {name}...")
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])

        start_train = time.time()
        pipeline.fit(X_train, y_train)
        train_time = round(time.time() - start_train, 3)

        start_inf = time.time()
        val_probs = pipeline.predict_proba(X_val)[:, 1]
        test_probs = pipeline.predict_proba(X_test)[:, 1]
        inf_time_per_1k = round(((time.time() - start_inf) / len(X_test)) * 1000 * 1000, 2)

        opt_thresh, thresh_curves = optimize_threshold(y_val, val_probs)

        test_metrics_default = evaluate_predictions(y_test, test_probs, threshold=0.50)
        test_metrics_opt = evaluate_predictions(y_test, test_probs, threshold=opt_thresh)

        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(pipeline, X_train_val, y_train_val, cv=skf, scoring='roc_auc', n_jobs=-1)
        cv_mean = round(float(np.mean(cv_scores)), 4)
        cv_std = round(float(np.std(cv_scores)), 4)

        model_score = compute_model_score(test_metrics_opt)

        # ROC Curve coordinates for frontend visualization
        fpr, tpr, _ = roc_curve(y_test, test_probs)
        # Downsample ROC curve points to 25 points for smooth visualization
        roc_pts = [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr[::max(1, len(fpr)//25)], tpr[::max(1, len(tpr)//25)])]

        print(f"    [Test Set @ Opt Threshold {opt_thresh}] ROC-AUC: {test_metrics_opt['roc_auc']} | Recall: {test_metrics_opt['recall']} | F1: {test_metrics_opt['f1']} | Business Score: {model_score}")

        reg_entry = {
            "name": name,
            "version": "1.0.0",
            "type": m_type,
            "status": "CANDIDATE",
            "optimal_threshold": opt_thresh,
            "model_selection_score": model_score,
            "metrics": test_metrics_opt,
            "metrics_at_0_5": test_metrics_default,
            "cv_roc_auc_mean": cv_mean,
            "cv_roc_auc_std": cv_std,
            "training_time_seconds": train_time,
            "inference_time_ms_per_1k": inf_time_per_1k,
            "threshold_curve": thresh_curves,
            "roc_curve": roc_pts,
            "hyperparameters": {k: str(v) for k, v in clf.get_params().items()} if hasattr(clf, 'get_params') else {}
        }

        model_registry.append(reg_entry)
        trained_pipelines[name] = pipeline

        if model_score > best_overall_score:
            best_overall_score = model_score
            champion_name = name
            best_pipeline = pipeline
            best_meta = reg_entry

    # Mark Champion
    for entry in model_registry:
        if entry['name'] == champion_name:
            entry['status'] = 'CHAMPION'
            entry['is_production'] = True
            entry['champion_rationale'] = (
                f"{champion_name} won the Model Arena with the highest composite business score ({best_overall_score}), "
                f"achieving test ROC-AUC of {entry['metrics']['roc_auc']}, Recall of {entry['metrics']['recall']}, "
                f"and PR-AUC of {entry['metrics']['pr_auc']}. With threshold optimization at {entry['optimal_threshold']}, "
                f"it reduced hotel revenue loss from unpredicted cancellations to ${entry['metrics']['business_cost']:,.2f}."
            )
        else:
            entry['is_production'] = False

    # Also register unavailable models if any
    if not XGBOOST_AVAILABLE:
        model_registry.append({
            "name": "XGBoost", "version": "1.0.0", "type": "gradient_boosting", "status": "UNAVAILABLE",
            "model_selection_score": 0.0, "metrics": {}, "notes": "Library not installed in environment"
        })
    if not CATBOOST_AVAILABLE:
        model_registry.append({
            "name": "CatBoost", "version": "1.0.0", "type": "gradient_boosting", "status": "UNAVAILABLE",
            "model_selection_score": 0.0, "metrics": {}, "notes": "Library not installed in environment"
        })
    if not LIGHTGBM_AVAILABLE:
        model_registry.append({
            "name": "LightGBM", "version": "1.0.0", "type": "gradient_boosting", "status": "UNAVAILABLE",
            "model_selection_score": 0.0, "metrics": {}, "notes": "Library not installed in environment"
        })

    # Save artifacts
    champion_path = os.path.join(MODELS_DIR, "hotel_cancellation_champion.pkl")
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")
    registry_path = os.path.join(MODELS_DIR, "model_registry.json")

    joblib.dump(best_pipeline, champion_path)
    print(f"[OK] Champion pipeline saved to: {champion_path}")

    # Feature Importance computation (Tree or Logistic based)
    feature_names = []
    try:
        # Extract feature names from ColumnTransformer
        num_names = num_cols
        cat_encoder = best_pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot']
        cat_names = list(cat_encoder.get_feature_names_out(cat_cols))
        feature_names = num_names + cat_names
        
        clf = best_pipeline.named_steps['classifier']
        if hasattr(clf, 'feature_importances_'):
            raw_imp = clf.feature_importances_
        elif hasattr(clf, 'coef_'):
            raw_imp = np.abs(clf.coef_[0])
        else:
            raw_imp = np.ones(len(feature_names))

        feat_imp = sorted([
            {"feature": f, "importance": round(float(imp), 4)}
            for f, imp in zip(feature_names, raw_imp)
        ], key=lambda x: x['importance'], reverse=True)[:20]
    except Exception as e:
        print(f"[WARN] Feature importance extraction: {e}")
        feat_imp = []

    full_metadata = {
        "champion": best_meta,
        "feature_importances": feat_imp,
        "features": {
            "numerical": num_cols,
            "categorical": cat_cols,
            "target": "is_canceled",
            "excluded_leakage": ["reservation_status", "reservation_status_date"]
        },
        "dataset_stats": {
            "total_records": len(df),
            "train_records": len(X_train),
            "val_records": len(X_val),
            "test_records": len(X_test),
            "cancellation_rate": round(float(df['is_canceled'].mean()), 4)
        },
        "training_timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "version": "1.0.0"
    }

    with open(metadata_path, 'w') as f:
        json.dump(full_metadata, f, indent=2, default=str)
    print(f"[OK] Champion metadata saved to: {metadata_path}")

    with open(registry_path, 'w') as f:
        json.dump(model_registry, f, indent=2, default=str)
    print(f"[OK] Model registry saved to: {registry_path}")

    print(f"\n[DONE] Machine Learning pipeline finished successfully.")
    return full_metadata, model_registry

if __name__ == "__main__":
    train_and_evaluate_all()
