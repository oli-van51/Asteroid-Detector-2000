import math
import requests

def CalculateImpactRadius(id, rad_min_km, rad_max_km, speed_km, ImpactAngle=math.pi/2):
    print(f"Input values: id={id}, rad_min={rad_min_km}, rad_max={rad_max_km}, speed={speed_km}, angle={ImpactAngle}")
    
    #scale accordingly
    rad_min = rad_min_km*1000
    rad_max = rad_max_km*1000
    speed = speed_km*1000
    print(f"Scaled values: rad_min={rad_min}, rad_max={rad_max}, speed={speed}")

    #fetch API
    url = f"https://ssd-api.jpl.nasa.gov/sbdb.api?sstr={id}"
    print(f"Requesting URL: {url}")
    response = requests.get(url)
    print(f"API Response status: {response.status_code}")
    print(f"API Response content: {response.text[:200]}...")
    data = response.json()
    
    #raise error if api coudn't be accessed
    if response.status_code != 200:
        raise Exception(f"Failed to fetch data for ID {id}: HTTP {response.status_code}")

    #get impact speed
    impact_speed = speed*math.sin(ImpactAngle)

    #get mass
    phys = data.get("phys_par", {})
    mass = phys.get("mass", None)

    #check wheather the database provides mass for the asteroid
    if mass is None:
        print("No mass data from API, calculating from density")

        #set density to average (3000kg/m^3)
        dens = 3000

        #calculate max and min mass
        mass_max = dens*(4/3)*math.pi*rad_max**3
        mass_min = dens*(4/3)*math.pi*rad_min**3
        print(f"Calculated masses: min={mass_min}, max={mass_max}")

        #impact energy calculation (i have converted it to megatons of TNT)
        ImpactEnergy_min = (1/2)*mass_min*impact_speed**2
        ImpactEnergy_max = (1/2)*mass_max*impact_speed**2
        print(f"Impact energies: min={ImpactEnergy_min}, max={ImpactEnergy_max}")
        
        impact_energy_min_TNT = ImpactEnergy_min / (4.184*10**15)
        impact_energy_max_TNT = ImpactEnergy_max / (4.184*10**15)
        print(f"Impact energies (TNT): min={impact_energy_min_TNT}, max={impact_energy_max_TNT}")

        #impact radius calculation
        impact_radius_min = 1.3*impact_energy_min_TNT**(1/3)
        impact_radius_max = 1.3*impact_energy_max_TNT**(1/3)
        print(f"Impact radii: min={impact_radius_min}, max={impact_radius_max}")

        #return values
        print("hi")
        return [(impact_radius_min + impact_radius_max) / 2, (impact_energy_min_TNT + impact_energy_max_TNT) / 2]

    else:
        mass = float(data["phys_par"]["mass"])
        ImpactEnergy = 1/2*mass*impact_speed**2
        impact_energy_TNT = ImpactEnergy / (4.184*10**15)
        impact_radius = 1.3*impact_energy_TNT**(1/3)
        print("hi")
        return impact_radius
    
    