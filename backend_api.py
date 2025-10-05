import requests
import date_fetcher
import math
import Planet_position_solver

def sendAPI():
    #define astronomical unit (in km)
    au = 149597870.7

    #place where i am going to store all of the data 
    api_send = []
    
    #array to send earth's orbital data
    earthxpos, earthypos = Planet_position_solver.PositionSolver(date_fetcher.GetMeanAnomalyEarth(), 0.0167, 149597870.7, 149576999.5)
    earthdata = [{"name":"earth", 
                  "semi_major_axis":149597870.7,
                  "semi_minor_axis":149576999.5,
                  "xpos":earthxpos,
                  "ypos":earthypos,
                  "offset_vector": 0.0167*149597870.7, 
                  "perihelion_argument": 102.95,
                  "ascending_node_longitude": 0,
                  "inclination": 0
                }]

    #url to get the asteroids based on closest approach
    url = "https://api.nasa.gov/neo/rest/v1/feed"
    
    #my api key
    my_api_key = "4D25143IhWiNtgtfYvR8GwssdA7C3Leaz2keSe8x"
    
    #to get start and end date
    today, week_later = date_fetcher.gettimes()
    
    #defining parameters
    params = {
        "start_date": today,
        "end_date": week_later,
        "api_key": my_api_key
    }
    
    #getting response, parsing it from JSON to python
    response = requests.get(url, params=params)
    data = response.json()
    
    #loop through all dates
    for date in data["near_earth_objects"]:
        #loops through neo's 
        for neo in data["near_earth_objects"][date]:
            #check if it is potentially hazardous
            if neo["is_potentially_hazardous_asteroid"]:
                #get neo data
                neo_url = f"https://api.nasa.gov/neo/rest/v1/neo/{neo['id']}"
                neo_response = requests.get(neo_url, params={"api_key":my_api_key})
                neo_data = neo_response.json() 
            
                #determine size of orbit
                a = float(neo_data["orbital_data"]["semi_major_axis"])*au
                e = float(neo_data["orbital_data"]["eccentricity"])
                b = a*math.sqrt(1-e**2)
                c = a*e

                #compute zpos and ypos
                mean_anomaly = math.radians(float(neo_data["orbital_data"]["mean_anomaly"]))
                xpos, ypos = Planet_position_solver.PositionSolver(mean_anomaly, e, a, b)
            
                #determine tilts of orbit
                Omega = math.radians(float(neo_data["orbital_data"]["ascending_node_longitude"]))
                inclination = math.radians(float(neo_data["orbital_data"]["inclination"]))
                omega = math.radians(float(neo_data["orbital_data"]["perihelion_argument"])-270)

                #send an api
                api_send.append({"name":neo['name'], 
                                 "id":neo["id"], 
                                 "estimated_diameter_min":float(neo["estimated_diameter"]["kilometers"]["estimated_diameter_min"]),
                                 "estimated_diameter_max":float(neo["estimated_diameter"]["kilometers"]["estimated_diameter_max"]),
                                 "relative_velocity_earth":float(neo["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"]),
                                 "semi_major_axis":a,
                                 "semi_minor_axis":b,
                                 "x_coordinate": xpos,
                                 "y_coordinate": ypos,
                                 "ascending_node_longitude":Omega,
                                 "inclination":inclination,
                                 "perihelion_argument":omega,
                                 "close_approach_date":date, 
                                 "offset_vector": c
                                })
  
    #return api data            
    return [api_send, earthdata]

print(sendAPI())