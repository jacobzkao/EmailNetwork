import kuzu

def process_graph_data(result):
    """
    Convert the result of the query into a format suitable for visualization.
    """

    result_df = result.get_as_df()

    nodes = []
    links = []

    node_ids = []
    for row in result_df['p'].items():
        r = row[1]
        node_id = r['_id']['offset']
        node = {"id" : node_id,
                "labels" : r["_label"],
                "properties" : {"emailAdd" : r['emailAdd']}}
        if node_id not in node_ids:
            node_ids.append(node_id) 
            nodes.append(node)

    for row in result_df['q'].items():
        r = row[1]
        node_id = r['_id']['offset']
        node = {"id" : node_id,
                "labels" : r["_label"],
                "properties" : {"emailAdd" : r['emailAdd']}}
        if node_id not in node_ids:
            node_ids.append(node_id) 
            nodes.append(node)


    for row in result_df['e'].items():
        r = row[1]
        new_link = {
            "source": r['_src']['offset'],
            "target": r['_dst']['offset'],
            "type": r["_label"],
            "properties": {
                "timestamp": r['timestamp'],
                "subject": r['subject'],
                "count": 1  # Initialize count to 1 for new links
            }
        }

        links.append(new_link)

    return {"nodes": list(nodes), "links": links}

def construct_query(nameSearchInput="", subjectSearchInput="", startDate="2014-01-06", endDate="2014-01-18", limit=250):
    """
    Construct Parameterized Query 
    Dates in format YYYY-MM-DD
    """
    endDate = endDate[:8] + str(int(endDate[8:]) + 1)

    query = 'MATCH (p:Person)-[e:Emailed]-(q:Person) ' \
            'WHERE e.timestamp >= date(' + "'" + startDate + "'" + ') ' \
            'AND e.timestamp <= date(' + "'" + endDate + "'" + ')' \
    
    if nameSearchInput != "":
        query += ' AND toLower(p.emailAdd) CONTAINS ' + "toLower('" + nameSearchInput + "')"

    if subjectSearchInput != "":
        query += ' AND toLower(e.subject) CONTAINS ' + "toLower('" + subjectSearchInput + "')"

    query += ' RETURN p, e, q LIMIT ' + str(limit)

    return query