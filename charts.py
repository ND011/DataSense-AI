import pandas as pd
from itertools import combinations

meta = pd.read_csv("dataset_column_annotations.csv")

chart_results = []

for dataset, group in meta.groupby("Dataset"):

    cols = group[["Column","Detected_Type"]]

    numeric_cols = cols[cols["Detected_Type"].isin(["continuous","discrete"])]["Column"].tolist()
    cat_cols = cols[cols["Detected_Type"]=="categorical"]["Column"].tolist()
    datetime_cols = cols[cols["Detected_Type"]=="datetime"]["Column"].tolist()

    dataset_type = group["Dataset_Type"].iloc[0]

    charts = []

    # ---------------------------------
    # Numeric distributions
    # ---------------------------------

    for col in numeric_cols:

        charts.append((dataset,"Histogram",col))
        charts.append((dataset,"Density Plot",col))
        charts.append((dataset,"Box Plot",col))
        charts.append((dataset,"Violin Plot",col))


    # ---------------------------------
    # Categorical distributions
    # ---------------------------------

    for col in cat_cols:

        charts.append((dataset,"Bar Chart",col))
        charts.append((dataset,"Horizontal Bar Chart",col))
        charts.append((dataset,"Pie Chart",col))
        charts.append((dataset,"Donut Chart",col))


    # ---------------------------------
    # Numeric vs Numeric
    # ---------------------------------

    for x,y in combinations(numeric_cols,2):

        charts.append((dataset,"Scatter Plot",f"{x} vs {y}"))
        charts.append((dataset,"Bubble Chart",f"{x} vs {y}"))


    # ---------------------------------
    # Categorical vs Numeric
    # ---------------------------------

    for c in cat_cols:
        for n in numeric_cols:

            charts.append((dataset,"Box Plot",f"{c} vs {n}"))
            charts.append((dataset,"Violin Plot",f"{c} vs {n}"))
            charts.append((dataset,"Bar Chart",f"{c} vs {n}"))
            charts.append((dataset,"Stacked Bar Chart",f"{c} vs {n}"))


    # ---------------------------------
    # Multiple numeric columns
    # ---------------------------------

    if len(numeric_cols) >= 2:

        charts.append((dataset,"Pair Plot",", ".join(numeric_cols)))


    # ---------------------------------
    # Correlation
    # ---------------------------------

    if len(numeric_cols) >= 3:

        charts.append((dataset,"Correlation Heatmap",", ".join(numeric_cols)))


    # ---------------------------------
    # Time series charts
    # ---------------------------------

    if datetime_cols:

        for d in datetime_cols:
            for n in numeric_cols:

                charts.append((dataset,"Line Chart",f"{d} vs {n}"))
                charts.append((dataset,"Area Chart",f"{d} vs {n}"))

        if len(numeric_cols) >= 2:

            charts.append((dataset,"Multi Line Chart",f"{datetime_cols[0]} vs {numeric_cols}"))
            charts.append((dataset,"Stacked Area Chart",f"{datetime_cols[0]} vs {numeric_cols}"))


    # ---------------------------------
    # Hierarchical charts
    # ---------------------------------

    if len(cat_cols) >= 2:

        charts.append((dataset,"Treemap",", ".join(cat_cols[:2])))
        charts.append((dataset,"Sunburst Chart",", ".join(cat_cols[:2])))


    # ---------------------------------
    # Flow charts
    # ---------------------------------

    if len(cat_cols) >= 2:

        charts.append((dataset,"Sankey Diagram",", ".join(cat_cols[:2])))


    # ---------------------------------
    # Funnel charts
    # ---------------------------------

    if len(cat_cols) >= 1 and len(numeric_cols) >= 1:

        charts.append((dataset,"Funnel Chart",f"{cat_cols[0]} vs {numeric_cols[0]}"))


    for c in charts:
        chart_results.append(c)


charts_df = pd.DataFrame(chart_results,columns=["Dataset","Chart","Columns"])

charts_df.to_csv("chart_recommendations.csv",index=False)

print("Extended chart recommendations generated.")