from flask import Flask, render_template, jsonify, request
from backend_api import sendAPI
from impact_radius import CalculateImpactRadius

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/data')
def data():
    return jsonify(
        sendAPI()
    )

@app.route('/simulate', methods=['GET'])
def simulate():
    print("hola")
    id = request.args.get('id')
    rad_min = float(request.args.get('rad_min'))
    rad_max = float(request.args.get('rad_max'))
    speed = float(request.args.get('speed'))
    angle = float(request.args.get('angle'))

    return jsonify(
        {0: CalculateImpactRadius(id, rad_min, rad_max, speed, angle)}
    )

if __name__ == "__main__":
    app.run(debug=True)