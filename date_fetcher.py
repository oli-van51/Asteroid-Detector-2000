from datetime import date, timedelta

def gettimes():
    today = date.today()
    week_later = today + timedelta(days=7)
    
    today_str = today.strftime("%Y-%m-%d")
    week_later_str = week_later.strftime("%Y-%m-%d")
    return today_str, week_later_str

def GetMeanAnomalyEarth():

    #get today's date
    today = date.today()

    # Convert the date object to a time tuple and access the tm_yday attribute
    d = today.timetuple().tm_yday

    #use an approximation to get mean anomaly of earth
    mean_earth_anomaly = (-3.18+0.98560*d) % 360

    #return mean anomaly
    return mean_earth_anomaly


