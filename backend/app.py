# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import utils


app = Flask(__name__)


# Replace 'http://example.com' and 'http://yourdomain.com' with the domains you want to allow
allowed_origins = ['http://127.0.0.1', 'http://yourdomain.com', '*']

# Initialize CORS with the allowed origins
CORS(app, resources={r"/*": {"origins": allowed_origins}})

@app.route('/')
def index():
    return jsonify({'message': 'Hello, Flask!'})

@app.route('/optionschain')
def options_chain():
    # Retrieve query parameters from the URL
    symbol = request.args.get('symbol', 'TSLA')
    exp_dt = request.args.get('exp_dt', '2023-07-28')
    option_type = request.args.get('optionType')  # Retrieve the option_type query parameter
    
    # Get the options data based on the provided parameters
    res = utils.get_options_chain(symbol=symbol, exp_dt=exp_dt, option_type=option_type)
    
    return jsonify({'message': res})

@app.route('/getquotes')
def get_quotes():
    res = utils.get_quotes()
    return jsonify({'message': res}) 

@app.route('/getorders')
def get_orders():
    res = utils.get_orders()
    print('res ->', res)
    return jsonify({'message': res}) 

@app.route('/getoptionsstrikeprice')
def get_options_strike_price():
    res = utils.get_option_strike_price()
    return jsonify({'message': res})  

@app.route('/placeoptionorder')
def place_option_order():
    # Retrieve query parameters from the URL
    symbol = request.args.get('symbol','').strip()
    exp_dt = request.args.get('expDate','').strip()
    option_symbol = request.args.get('optionSymbol','').strip()
    qty = request.args.get('qty','1').strip()
    side_select = request.args.get('sideSelect','').strip()
    type_select = request.args.get('typeSelect','').strip()
    duration_select = request.args.get('durationSelect','').strip()
    price = request.args.get('price','').strip()
    stop = request.args.get('stop','').strip()

    # print('symbol -> ', qty)

    res = utils.place_option_order(
        symbol=symbol, 
        exp_dt=exp_dt,
        option_symbol=option_symbol, 
        qty=qty,
        side_select=side_select,
        type_select=type_select,
        duration_select=duration_select,
        price=price,
        stop=stop
        )
    print('res -> ', res)
    return jsonify({'message': res})   

@app.route('/cancelorder')
def cancel_option_order():
    order_id = request.args.get('order_id') 
    res = utils.cancel_order(order_id=order_id)
    return jsonify({'message': res})  

@app.route('/timesales')
def time_sales():
    symbol = request.args.get('symbol') 
    res = utils.get_time_sales(symbol,'b','c','d','e')
    return jsonify({'message': res})

if __name__ == '__main__':
    app.run(debug=True)