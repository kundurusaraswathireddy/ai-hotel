"""
HotelGuard AI - Streamlit Web Application
Autonomous Hotel Cancellation Intelligence Platform
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

# ---------------------------------------------------------
# Page Configuration
# ---------------------------------------------------------
st.set_page_config(
    page_title="HotelGuard AI - Cancellation Intelligence",
    page_icon="🏨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 1.2rem;
        text-align: center;
    }
    .risk-badge-low {
        background-color: #DCFCE7;
        color: #166534;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
    }
    .risk-badge-mod {
        background-color: #FEF9C3;
        color: #854D0E;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
    }
    .risk-badge-high {
        background-color: #FFEDD5;
        color: #9A3412;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
    }
    .risk-badge-crit {
        background-color: #FEE2E2;
        color: #991B1B;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
    }
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------
# Resource Caching
# ---------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

@st.cache_resource
def load_champion_model():
    model_path = os.path.join(MODELS_DIR, "hotel_cancellation_champion.pkl")
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    
    pipeline = None
    metadata = {}
    
    if os.path.exists(model_path):
        pipeline = joblib.load(model_path)
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            metadata = json.load(f)
            
    return pipeline, metadata

@st.cache_data
def load_dataset_sample(n=1000):
    data_path = os.path.join(DATA_DIR, "hotel_bookings.csv")
    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
        for col in ['reservation_status', 'reservation_status_date']:
            if col in df.columns:
                df = df.drop(columns=[col])
        return df.head(n)
    return None

pipeline, metadata = load_champion_model()
df_sample = load_dataset_sample(2000)

def get_risk_tier(prob: float):
    if prob < 0.25:
        return "LOW", "risk-badge-low", "#16A34A"
    elif prob < 0.50:
        return "MODERATE", "risk-badge-mod", "#CA8A04"
    elif prob < 0.75:
        return "HIGH", "risk-badge-high", "#EA580C"
    else:
        return "CRITICAL", "risk-badge-crit", "#DC2626"

# ---------------------------------------------------------
# Sidebar Navigation
# ---------------------------------------------------------
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/hotel-star.png", width=64)
    st.title("HotelGuard AI")
    st.caption("Autonomous Cancellation Intelligence")
    st.markdown("---")
    
    menu = st.radio(
        "Navigation",
        [
            "🎯 Single Booking Risk",
            "⚡ What-If Simulator",
            "📁 Batch CSV Predictor",
            "📊 Model Arena & Insights",
            "🔍 Dataset Explorer"
        ]
    )
    
    st.markdown("---")
    if metadata:
        champ = metadata.get("champion", {})
        st.caption(f"**Champion Model**: {champ.get('name', 'LightGBM')}")
        st.caption(f"**ROC-AUC**: {champ.get('metrics', {}).get('roc_auc', 0.9442):.4f}")
        st.caption(f"**Recall**: {champ.get('metrics', {}).get('recall', 0.9727):.4f}")
        st.caption(f"**Optimal Threshold**: {champ.get('optimal_threshold', 0.15)}")

# ---------------------------------------------------------
# Page 1: Single Booking Risk Prediction
# ---------------------------------------------------------
if menu == "🎯 Single Booking Risk":
    st.markdown('<div class="main-title">🎯 Real-Time Booking Cancellation Risk</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Score individual hotel reservation profiles against the Champion LightGBM Model Pipeline.</div>', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.subheader("🛎️ Booking Core")
        hotel = st.selectbox("Hotel Type", ["City Hotel", "Resort Hotel"], index=0)
        lead_time = st.slider("Lead Time (Days before arrival)", 0, 400, 45)
        arrival_date_month = st.selectbox("Arrival Month", ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], index=7)
        arrival_date_year = st.selectbox("Arrival Year", [2015, 2016, 2017, 2018, 2019], index=2)
        arrival_date_week_number = st.slider("Arrival Week Number", 1, 53, 33)
        arrival_date_day_of_month = st.slider("Arrival Day of Month", 1, 31, 15)

    with col2:
        st.subheader("🧳 Stay & Guest Details")
        stays_in_week_nights = st.number_input("Week Nights", min_value=0, max_value=30, value=3)
        stays_in_weekend_nights = st.number_input("Weekend Nights", min_value=0, max_value=20, value=2)
        adults = st.number_input("Adults", min_value=1, max_value=10, value=2)
        children = st.number_input("Children", min_value=0, max_value=10, value=0)
        babies = st.number_input("Babies", min_value=0, max_value=5, value=0)
        meal = st.selectbox("Meal Plan", ["BB", "HB", "FB", "SC", "Undefined"], index=0)
        country = st.selectbox("Country of Origin", ["PRT", "GBR", "FRA", "ESP", "DEU", "ITA", "IRL", "BEL", "BRA", "NLD", "USA", "CHE", "CN"], index=0)

    with col3:
        st.subheader("💳 Market & Channels")
        market_segment = st.selectbox("Market Segment", ["Online TA", "Offline TA/TO", "Direct", "Corporate", "Groups", "Complementary", "Aviation"], index=0)
        distribution_channel = st.selectbox("Distribution Channel", ["TA/TO", "Direct", "Corporate", "GDS"], index=0)
        customer_type = st.selectbox("Customer Type", ["Transient", "Transient-Party", "Contract", "Group"], index=0)
        deposit_type = st.selectbox("Deposit Type", ["No Deposit", "Non Refund", "Refundable"], index=0)
        adr = st.number_input("Average Daily Rate (ADR in $)", min_value=0.0, max_value=1000.0, value=115.0, step=5.0)
        total_of_special_requests = st.slider("Special Requests", 0, 5, 1)
        required_car_parking_spaces = st.slider("Parking Spaces Required", 0, 5, 0)
        previous_cancellations = st.number_input("Previous Cancellations", min_value=0, max_value=20, value=0)
        previous_bookings_not_canceled = st.number_input("Previous Non-Canceled Bookings", min_value=0, max_value=50, value=0)
        is_repeated_guest = st.selectbox("Repeated Guest?", [0, 1], format_func=lambda x: "Yes" if x == 1 else "No", index=0)
        booking_changes = st.number_input("Booking Changes Made", min_value=0, max_value=10, value=0)
        days_in_waiting_list = st.number_input("Days on Waiting List", min_value=0, max_value=300, value=0)
        reserved_room_type = st.selectbox("Reserved Room", ["A", "B", "C", "D", "E", "F", "G", "H"], index=0)
        assigned_room_type = st.selectbox("Assigned Room", ["A", "B", "C", "D", "E", "F", "G", "H"], index=0)

    st.markdown("---")
    
    if st.button("🚀 Calculate Cancellation Risk", use_container_width=True, type="primary"):
        if pipeline is None:
            st.error("Champion model pipeline not found. Please verify models folder.")
        else:
            booking_payload = {
                "hotel": hotel, "lead_time": lead_time, "arrival_date_year": arrival_date_year,
                "arrival_date_month": arrival_date_month, "arrival_date_week_number": arrival_date_week_number,
                "arrival_date_day_of_month": arrival_date_day_of_month, "stays_in_weekend_nights": stays_in_weekend_nights,
                "stays_in_week_nights": stays_in_week_nights, "adults": adults, "children": float(children),
                "babies": babies, "meal": meal, "country": country, "market_segment": market_segment,
                "distribution_channel": distribution_channel, "is_repeated_guest": is_repeated_guest,
                "previous_cancellations": previous_cancellations, "previous_bookings_not_canceled": previous_bookings_not_canceled,
                "reserved_room_type": reserved_room_type, "assigned_room_type": assigned_room_type,
                "booking_changes": booking_changes, "deposit_type": deposit_type,
                "days_in_waiting_list": days_in_waiting_list, "customer_type": customer_type,
                "adr": float(adr), "required_car_parking_spaces": required_car_parking_spaces,
                "total_of_special_requests": total_of_special_requests
            }
            
            num_cols = metadata['features']['numerical']
            cat_cols = metadata['features']['categorical']
            input_df = pd.DataFrame([booking_payload])[num_cols + cat_cols]
            
            prob = float(pipeline.predict_proba(input_df)[0, 1])
            tier, badge_cls, color = get_risk_tier(prob)
            total_nights = max(1, stays_in_week_nights + stays_in_weekend_nights)
            total_value = adr * total_nights
            expected_loss = prob * total_value
            
            st.markdown("### 📊 Prediction Result")
            res1, res2, res3, res4 = st.columns(4)
            
            with res1:
                st.metric("Cancellation Probability", f"{prob*100:.1f}%")
            with res2:
                st.metric("Risk Classification", tier)
            with res3:
                st.metric("Total Booking Value", f"${total_value:,.2f}")
            with res4:
                st.metric("Expected Revenue At Risk", f"${expected_loss:,.2f}")
                
            # Visual Gauge
            fig = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = prob * 100,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Cancellation Probability (%)", 'font': {'size': 20}},
                gauge = {
                    'axis': {'range': [None, 100], 'tickwidth': 1},
                    'bar': {'color': color},
                    'steps': [
                        {'range': [0, 25], 'color': '#DCFCE7'},
                        {'range': [25, 50], 'color': '#FEF9C3'},
                        {'range': [50, 75], 'color': '#FFEDD5'},
                        {'range': [75, 100], 'color': '#FEE2E2'}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': metadata.get("champion", {}).get("optimal_threshold", 0.15) * 100
                    }
                }
            ))
            fig.update_layout(height=280, margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig, use_container_width=True)

# ---------------------------------------------------------
# Page 2: What-If Simulator
# ---------------------------------------------------------
elif menu == "⚡ What-If Simulator":
    st.markdown('<div class="main-title">⚡ What-If Scenario Simulator</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Dynamically tweak pricing, lead time, deposit policy, or room assignments to observe risk sensitivity.</div>', unsafe_allow_html=True)
    
    col_a, col_b = st.columns(2)
    
    with col_a:
        st.subheader("🔵 Baseline Booking")
        base_lead = st.slider("Base Lead Time", 0, 365, 90, key="base_lead")
        base_adr = st.slider("Base ADR ($)", 30, 400, 140, key="base_adr")
        base_deposit = st.selectbox("Base Deposit Type", ["No Deposit", "Non Refund", "Refundable"], key="base_deposit")
        base_requests = st.slider("Base Special Requests", 0, 5, 0, key="base_requests")
        base_segment = st.selectbox("Base Market Segment", ["Online TA", "Offline TA/TO", "Direct", "Corporate", "Groups"], key="base_segment")

    with col_b:
        st.subheader("🟢 Modified Booking")
        mod_lead = st.slider("Modified Lead Time", 0, 365, 30, key="mod_lead")
        mod_adr = st.slider("Modified ADR ($)", 30, 400, 115, key="mod_adr")
        mod_deposit = st.selectbox("Modified Deposit Type", ["No Deposit", "Non Refund", "Refundable"], key="mod_deposit")
        mod_requests = st.slider("Modified Special Requests", 0, 5, 2, key="mod_requests")
        mod_segment = st.selectbox("Modified Market Segment", ["Online TA", "Offline TA/TO", "Direct", "Corporate", "Groups"], key="mod_segment")
        
    if pipeline is not None and metadata:
        num_cols = metadata['features']['numerical']
        cat_cols = metadata['features']['categorical']
        
        def make_df(lead, adr, deposit, reqs, seg):
            sample = {
                "hotel": "City Hotel", "lead_time": lead, "arrival_date_year": 2017,
                "arrival_date_month": "August", "arrival_date_week_number": 33,
                "arrival_date_day_of_month": 15, "stays_in_weekend_nights": 2,
                "stays_in_week_nights": 3, "adults": 2, "children": 0.0,
                "babies": 0, "meal": "BB", "country": "PRT", "market_segment": seg,
                "distribution_channel": "TA/TO", "is_repeated_guest": 0,
                "previous_cancellations": 0, "previous_bookings_not_canceled": 0,
                "reserved_room_type": "A", "assigned_room_type": "A",
                "booking_changes": 0, "deposit_type": deposit,
                "days_in_waiting_list": 0, "customer_type": "Transient",
                "adr": float(adr), "required_car_parking_spaces": 0,
                "total_of_special_requests": reqs
            }
            return pd.DataFrame([sample])[num_cols + cat_cols]
            
        prob_base = float(pipeline.predict_proba(make_df(base_lead, base_adr, base_deposit, base_requests, base_segment))[0, 1])
        prob_mod = float(pipeline.predict_proba(make_df(mod_lead, mod_adr, mod_deposit, mod_requests, mod_segment))[0, 1])
        delta = prob_mod - prob_base
        
        st.markdown("---")
        m1, m2, m3 = st.columns(3)
        with m1:
            st.metric("Baseline Risk", f"{prob_base*100:.1f}%")
        with m2:
            st.metric("Modified Risk", f"{prob_mod*100:.1f}%")
        with m3:
            st.metric("Risk Delta", f"{delta*100:+.1f}%", delta_color="inverse")
            
        # Comparison Bar
        comp_df = pd.DataFrame({
            "Scenario": ["Baseline", "Modified"],
            "Probability (%)": [prob_base * 100, prob_mod * 100]
        })
        fig = px.bar(comp_df, x="Scenario", y="Probability (%)", color="Scenario",
                     color_discrete_map={"Baseline": "#64748B", "Modified": "#2563EB"},
                     title="Cancellation Risk Shift Comparison", text_auto=".1f")
        fig.update_layout(height=350)
        st.plotly_chart(fig, use_container_width=True)

# ---------------------------------------------------------
# Page 3: Batch CSV Predictor
# ---------------------------------------------------------
elif menu == "📁 Batch CSV Predictor":
    st.markdown('<div class="main-title">📁 Batch Booking CSV Prediction</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Upload a batch CSV file to score cancellation risk for multiple reservations simultaneously.</div>', unsafe_allow_html=True)
    
    uploaded_file = st.file_uploader("Choose a CSV file", type=["csv"])
    
    if uploaded_file is not None:
        try:
            df_upload = pd.read_csv(uploaded_file)
            st.success(f"Successfully loaded {len(df_upload):,} records!")
            
            if pipeline is not None and metadata:
                num_cols = metadata['features']['numerical']
                cat_cols = metadata['features']['categorical']
                req_cols = num_cols + cat_cols
                
                missing = [c for c in req_cols if c not in df_upload.columns]
                if missing:
                    st.warning(f"Note: {len(missing)} missing columns will be populated with sensible defaults: {missing[:5]}...")
                    for c in missing:
                        df_upload[c] = 0 if c in num_cols else "Unknown"
                        
                X_batch = df_upload[req_cols].copy()
                probs = pipeline.predict_proba(X_batch)[:, 1]
                df_upload["cancellation_probability"] = np.round(probs, 4)
                df_upload["risk_tier"] = [get_risk_tier(p)[0] for p in probs]
                
                b1, b2, b3 = st.columns(3)
                with b1:
                    st.metric("Total Bookings", f"{len(df_upload):,}")
                with b2:
                    st.metric("Average Risk", f"{probs.mean()*100:.1f}%")
                with b3:
                    high_risk_pct = (probs >= 0.5).mean() * 100
                    st.metric("High/Critical Risk Bookings", f"{high_risk_pct:.1f}%")
                    
                # Distribution Chart
                fig = px.histogram(df_upload, x="cancellation_probability", color="risk_tier",
                                   nbins=30, title="Batch Risk Probability Distribution",
                                   color_discrete_map={"LOW": "#16A34A", "MODERATE": "#CA8A04", "HIGH": "#EA580C", "CRITICAL": "#DC2626"})
                st.plotly_chart(fig, use_container_width=True)
                
                st.dataframe(df_upload[["hotel", "lead_time", "adr", "market_segment", "cancellation_probability", "risk_tier"]].head(100))
                
                # Download Button
                csv_data = df_upload.to_csv(index=False).encode('utf-8')
                st.download_button(
                    label="📥 Download Scored CSV",
                    data=csv_data,
                    file_name="hotelguard_scored_predictions.csv",
                    mime="text/csv",
                    type="primary"
                )
        except Exception as e:
            st.error(f"Error processing CSV: {e}")

# ---------------------------------------------------------
# Page 4: Model Arena & Insights
# ---------------------------------------------------------
elif menu == "📊 Model Arena & Insights":
    st.markdown('<div class="main-title">📊 Champion Model Architecture & Insights</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">LightGBM Gradient Boosting model benchmarks, feature importance, and threshold metrics.</div>', unsafe_allow_html=True)
    
    if metadata:
        champ = metadata.get("champion", {})
        metrics = champ.get("metrics", {})
        
        k1, k2, k3, k4 = st.columns(4)
        with k1:
            st.metric("Test ROC-AUC", f"{metrics.get('roc_auc', 0.9442):.4f}")
        with k2:
            st.metric("Test Recall", f"{metrics.get('recall', 0.9727):.4f}")
        with k3:
            st.metric("Test Precision", f"{metrics.get('precision', 0.6126):.4f}")
        with k4:
            st.metric("Optimal Threshold", f"{champ.get('optimal_threshold', 0.15)}")
            
        # Top Feature Importances
        feat_data = metadata.get("feature_importances", [])
        if feat_data:
            df_feat = pd.DataFrame(feat_data).sort_values("importance", ascending=True).tail(15)
            fig = px.bar(df_feat, x="importance", y="feature", orientation="h",
                         title="Top 15 Predictive Features in Champion Model",
                         color="importance", color_continuous_scale="Blues")
            fig.update_layout(height=450)
            st.plotly_chart(fig, use_container_width=True)

# ---------------------------------------------------------
# Page 5: Dataset Explorer
# ---------------------------------------------------------
elif menu == "🔍 Dataset Explorer":
    st.markdown('<div class="main-title">🔍 Historical Booking Demand Dataset</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">119,390 historical hotel booking records with leakage enforcement.</div>', unsafe_allow_html=True)
    
    if df_sample is not None:
        st.dataframe(df_sample.head(200), use_container_width=True)
        
        c1, c2 = st.columns(2)
        with c1:
            fig = px.pie(df_sample, names="hotel", title="Hotel Type Distribution", color_discrete_sequence=px.colors.qualitative.Set2)
            st.plotly_chart(fig, use_container_width=True)
        with c2:
            fig = px.box(df_sample, x="hotel", y="lead_time", color="hotel", title="Lead Time Distribution by Hotel")
            st.plotly_chart(fig, use_container_width=True)
