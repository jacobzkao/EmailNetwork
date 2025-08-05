# 📧 Email Network Visualizer

This is an interactive web application for visualizing email communication networks over time. It enables users to query, filter, and explore email metadata through a dynamic graph interface.

[ 🔗 *Click on the image to watch a video!* ]
[![Watch the video](https://github.com/user-attachments/assets/f15a8d4c-308c-4250-b18a-ba8f01e75645)](https://drive.google.com/file/d/1TWyvDm6QB-l8E2fuBmMN2N1pdMPelHF2/view?usp=sharing)



## 🔍 Overview

- **Nodes** represent individual email addresses.
- **Edges** represent email exchanges between those addresses.
- **Node size** is proportional to the number of emails sent by the address.
- **Edge thickness/color** reflects the volume of communication between users.
- **Edge click** reveals a detailed list of email subjects exchanged between two users.

## 🛠️ Features

### ❔ Query Parameters

Users can customize the email network using the following parameters:

- **Date Range**: Select the range of dates to include emails from.
- **Result Limit**: Set the maximum number of emails to display.
- **Search Email Addresses**: Filter the graph to include only nodes (email addresses) matching your input.
- **Search Subjects**: Filter edges based on keywords found in the email subjects.

### ⚙️ Visualization Options

- **Toggle Email Addresses**: Show or hide email labels on nodes.
- **Toggle Email Counts**: Show the number of emails on each edge.
- **Adjust Node Size**: Choose small, medium, or large node display.

## 🖥️ Tech Stack

- **Frontend**: JavaScript, HTML, CSS
- **Backend**: Python (Flask)
- **Database**: [KuzuDB](https://kuzudb.com/)
- **Query Language**: Cypher for graph data querying

## 🚀 How It Works

1. User submits query parameters (dates, subject keywords, etc.)
2. Flask API sends Cypher queries to KuzuDB.
3. Query results (nodes and edges) are returned to the frontend.
4. A network graph is rendered using dynamic sizing and coloring to represent data.
5. Clicking on an edge reveals all email subjects exchanged between the connected users.
