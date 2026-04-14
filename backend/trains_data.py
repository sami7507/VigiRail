"""
trains_data.py
Real Indian Railway trains with their routes, zones, and station data.
In a real deployment, this would connect to the IRCTC / NTES API.
For the hackathon, we use accurate static data with simulated sensor values per station.
"""

TRAINS = {
    "12951": {
        "name": "Mumbai Rajdhani Express",
        "number": "12951",
        "zone": "Western Railway",
        "type": "Rajdhani",
        "from": "Mumbai Central",
        "to": "New Delhi",
        "distance_km": 1384,
        "avg_speed_kmh": 88,
        "rake_type": "LHB",
        "route": [
            {"code": "MMCT", "name": "Mumbai Central",   "km": 0,    "state": "Maharashtra"},
            {"code": "BRC",  "name": "Vadodara Jn",      "km": 391,  "state": "Gujarat"},
            {"code": "RTM",  "name": "Ratlam Jn",        "km": 528,  "state": "Madhya Pradesh"},
            {"code": "KTB",  "name": "Kota Jn",          "km": 755,  "state": "Rajasthan"},
            {"code": "SWM",  "name": "Sawai Madhopur",   "km": 844,  "state": "Rajasthan"},
            {"code": "NDLS", "name": "New Delhi",        "km": 1384, "state": "Delhi"},
        ]
    },
    "12301": {
        "name": "Howrah Rajdhani Express",
        "number": "12301",
        "zone": "Eastern Railway",
        "type": "Rajdhani",
        "from": "Howrah Jn",
        "to": "New Delhi",
        "distance_km": 1441,
        "avg_speed_kmh": 85,
        "rake_type": "LHB",
        "route": [
            {"code": "HWH",  "name": "Howrah Jn",        "km": 0,    "state": "West Bengal"},
            {"code": "DKAE", "name": "Dankuni",          "km": 18,   "state": "West Bengal"},
            {"code": "ASN",  "name": "Asansol Jn",       "km": 200,  "state": "West Bengal"},
            {"code": "GAYA", "name": "Gaya Jn",          "km": 420,  "state": "Bihar"},
            {"code": "PNBE", "name": "Patna Jn",         "km": 531,  "state": "Bihar"},
            {"code": "MGS",  "name": "Mughal Sarai Jn",  "km": 671,  "state": "Uttar Pradesh"},
            {"code": "CNB",  "name": "Kanpur Central",   "km": 979,  "state": "Uttar Pradesh"},
            {"code": "NDLS", "name": "New Delhi",        "km": 1441, "state": "Delhi"},
        ]
    },
    "12002": {
        "name": "Bhopal Shatabdi Express",
        "number": "12002",
        "zone": "North Central Railway",
        "type": "Shatabdi",
        "from": "Habibganj",
        "to": "New Delhi",
        "distance_km": 702,
        "avg_speed_kmh": 100,
        "rake_type": "LHB",
        "route": [
            {"code": "HBJ",  "name": "Habibganj (Bhopal)","km": 0,   "state": "Madhya Pradesh"},
            {"code": "VID",  "name": "Vidisha",           "km": 55,  "state": "Madhya Pradesh"},
            {"code": "BHS",  "name": "Bina Jn",           "km": 155, "state": "Madhya Pradesh"},
            {"code": "JHS",  "name": "Jhansi Jn",         "km": 311, "state": "Uttar Pradesh"},
            {"code": "GWL",  "name": "Gwalior Jn",        "km": 419, "state": "Madhya Pradesh"},
            {"code": "AGC",  "name": "Agra Cantt",        "km": 498, "state": "Uttar Pradesh"},
            {"code": "NDLS", "name": "New Delhi",         "km": 702, "state": "Delhi"},
        ]
    },
    "16352": {
        "name": "Nagercoil Chennai Express",
        "number": "16352",
        "zone": "Southern Railway",
        "type": "Express",
        "from": "Nagercoil Jn",
        "to": "Chennai Egmore",
        "distance_km": 689,
        "avg_speed_kmh": 62,
        "rake_type": "ICF",
        "route": [
            {"code": "NCJ",  "name": "Nagercoil Jn",     "km": 0,   "state": "Tamil Nadu"},
            {"code": "TVC",  "name": "Thiruvananthapuram","km": 88,  "state": "Kerala"},
            {"code": "QLN",  "name": "Kollam Jn",        "km": 147, "state": "Kerala"},
            {"code": "ERS",  "name": "Ernakulam Jn",     "km": 298, "state": "Kerala"},
            {"code": "TCR",  "name": "Thrissur",         "km": 370, "state": "Kerala"},
            {"code": "CBE",  "name": "Coimbatore Jn",    "km": 484, "state": "Tamil Nadu"},
            {"code": "SA",   "name": "Salem Jn",         "km": 575, "state": "Tamil Nadu"},
            {"code": "MS",   "name": "Chennai Egmore",   "km": 689, "state": "Tamil Nadu"},
        ]
    },
    "12429": {
        "name": "Lucknow Mail",
        "number": "12429",
        "zone": "Northern Railway",
        "type": "Mail",
        "from": "New Delhi",
        "to": "Lucknow",
        "distance_km": 512,
        "avg_speed_kmh": 71,
        "rake_type": "ICF",
        "route": [
            {"code": "NDLS", "name": "New Delhi",        "km": 0,   "state": "Delhi"},
            {"code": "GZB",  "name": "Ghaziabad",        "km": 27,  "state": "Uttar Pradesh"},
            {"code": "MB",   "name": "Moradabad",        "km": 167, "state": "Uttar Pradesh"},
            {"code": "BE",   "name": "Bareilly Jn",      "km": 252, "state": "Uttar Pradesh"},
            {"code": "SHC",  "name": "Shahjahanpur",     "km": 330, "state": "Uttar Pradesh"},
            {"code": "HRI",  "name": "Hardoi",           "km": 405, "state": "Uttar Pradesh"},
            {"code": "LKO",  "name": "Lucknow",          "km": 512, "state": "Uttar Pradesh"},
        ]
    },
    "12648": {
        "name": "Kongu Express",
        "number": "12648",
        "zone": "Southern Railway",
        "type": "Express",
        "from": "Coimbatore Jn",
        "to": "Chennai Central",
        "distance_km": 493,
        "avg_speed_kmh": 68,
        "rake_type": "ICF",
        "route": [
            {"code": "CBE",  "name": "Coimbatore Jn",   "km": 0,   "state": "Tamil Nadu"},
            {"code": "TUP",  "name": "Tiruppur",         "km": 52,  "state": "Tamil Nadu"},
            {"code": "ED",   "name": "Erode Jn",         "km": 111, "state": "Tamil Nadu"},
            {"code": "SA",   "name": "Salem Jn",         "km": 181, "state": "Tamil Nadu"},
            {"code": "JTJ",  "name": "Jolarpettai",      "km": 247, "state": "Tamil Nadu"},
            {"code": "KPD",  "name": "Katpadi Jn",       "km": 305, "state": "Tamil Nadu"},
            {"code": "MAS",  "name": "Chennai Central",  "km": 493, "state": "Tamil Nadu"},
        ]
    },
}
