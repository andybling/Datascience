import pandas as pd
import numpy as np
import altair as alt
import streamlit as st
from datetime import datetime

# Function to generate data
def generate_data():
    dates = pd.date_range(start='2022-01-01', end=datetime.today())
    sales = np.random.uniform(500, 5000, size=len(dates))
    category = np.random.choice(['Bank_Account', 'Credit_cards', 'Loans'], size=len(dates))
    return pd.DataFrame({'Date': dates, 'Sales': sales, 'Category': category})

# Load data
data = generate_data()

# Style CSS pour l'image de fond
st.markdown(
    """
    <style>
    .stApp {
        background-color: black;  /* Couleur de fond */
    }
    </style>
    """,
    unsafe_allow_html=True
)
# Sidebar
st.sidebar.title("Bank Sales Dashboard")
category = st.sidebar.selectbox("Select Category", options=["All", "Bank_Account", "Credit_cards", "Loans"])
date_range = st.sidebar.date_input("Select Date Range", value=(datetime(2022, 1, 1), datetime(2024, 12, 31)))

# Filter data
filtered_data = data[(data['Date'] >= pd.to_datetime(date_range[0])) & (data['Date'] <= pd.to_datetime(date_range[1]))]
if category != "All":
    filtered_data = filtered_data[filtered_data['Category'] == category]

# Tabs
tab1, tab2, tab3 = st.tabs(["Marketing Overview", "Bank Category Breakdown", "Bank Sales Trends"])

# Overview
with tab1:
    st.header("Bank Sales Overview")
    chart = alt.Chart(filtered_data).mark_line(color="white").encode(
        x='Date:T',
        y='Sales:Q'
    ).properties(
        title='Sales Overview'
    )
    
    st.altair_chart(chart, use_container_width=True)

# Category Breakdown
with tab2:
    st.header("Bank Category Breakdown")
    chart = alt.Chart(filtered_data).mark_bar().encode(
        x='Category:N',
        y='Sales:Q',
        color=alt.Color('Category:N', scale=alt.Scale(domain=['Bank_Account', 'Credit_cards', 'Loans'],
                                                       range=['red', 'black', 'white']))  # Use color scale
    ).properties(
        title='Bank Category Breakdown'
    )
    st.altair_chart(chart, use_container_width=True)

# Sales Trends
with tab3:
    st.header("Bank Sales Trends")
    chart = alt.Chart(filtered_data).mark_line().encode(
        x='Date:T',
        y='Sales:Q',
        color=alt.Color('Category:N', scale=alt.Scale(domain=['Bank_Account', 'Credit_cards', 'Loans'],
                                                       range=['red', 'black', 'white']))  # Use color scale
    ).properties(
        title='Sales Trends'
    )
    st.altair_chart(chart, use_container_width=True)