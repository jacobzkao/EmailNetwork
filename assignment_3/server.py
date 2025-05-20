import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from graph_viz import process_graph_data, construct_query

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from utils import setup_database

app = Flask(__name__, static_folder='frontend')

# Initialize KuzuDB
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DB_PATH = os.path.join(ROOT_DIR, 'Final Project\\assignment_3\\tmp')

print(f"Using database path: {DB_PATH}")
conn = setup_database(DB_PATH, delete_existing=False)

@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('frontend', path)

@app.route('/api/graph', methods=['POST'])
def get_graph_data():
    try:
        # Get request data
        print("Received request data")
        request_data = request.get_json()
        print(request_data)

        # Extract parameters from request data
        nameSearchInput = request_data['nameSearchInput']
        subjectSearchInput = request_data['subjectSearchInput']
        limit = request_data['limit']
        startDate = request_data['startDate']
        endDate = request_data['endDate']

        # Construct query based on parameters from front end        
        if subjectSearchInput is not None and nameSearchInput is not None and limit is not None and startDate is not None and endDate is not None:
            query = construct_query(nameSearchInput, subjectSearchInput, startDate, endDate, limit)
            print(f"\nQuery: {query}")
        
        result = conn.execute(query)
        
        process_graph_data(result)
        
        # Process the result into a format suitable for D3.js
        graph_data = process_graph_data(result)
        
        print(f"\nReturning graph data with {len(graph_data['nodes'])} nodes and {len(graph_data['links'])} links")
        return jsonify(graph_data)
    except Exception as e:
        print(f"Error processing graph data request: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/status', methods=['GET'])
def api_status():
    """
    Endpoint for checking API status and database connection
    """
    try:
        # Check database connection
        result = conn.execute("MATCH (n) RETURN count(n) as count LIMIT 1")
        node_count = result.get_next()[0]
        
        return jsonify({
            "status": "ok",
            "database": "connected",
            "nodeCount": node_count
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    # Use 0.0.0.0 to make it accessible from any IP
    app.run(host='0.0.0.0', port=2400, debug=True)