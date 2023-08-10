# app.py
from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
import utils
import automate


app = Flask(__name__, static_folder="frontend/static",
            template_folder="frontend")


# Replace 'http://example.com' and 'http://yourdomain.com' with the domains you want to allow
allowed_origins = ['http://127.0.0.1',
                   '*', 'https://tradier-app-b7ceb132d0e1.herokuapp.com/']

# Initialize CORS with the allowed origins
CORS(app, resources={r"/*": {"origins": allowed_origins}})


@app.route('/')
def index():
    return jsonify({'message': 'Hello, Flask!'})


# @app.route('/index.html')
# def index():
#     return send_from_directory('../frontend', 'index.html')

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/static/<path:path>')
# def send_static(path):
#     return send_from_directory('../frontend', path)

# @app.route('/static/<path:path>')
# def send_static(path):
#     return send_from_directory('../frontend', path)


@app.route('/optionschain')
def options_chain():
    # Retrieve query parameters from the URL
    symbol = request.args.get('symbol', 'TSLA')
    exp_dt = request.args.get('exp_dt', '2023-07-28')
    # Retrieve the option_type query parameter
    option_type = request.args.get('optionType')

    # Get the options data based on the provided parameters
    res = utils.get_options_chain(
        symbol=symbol, exp_dt=exp_dt, option_type=option_type)

    return jsonify({'message': res})


@app.route('/getquotes')
def get_quotes():
    res = utils.get_quotes()
    return jsonify({'message': res})


@app.route('/user/profile')
def get_user_profile():
    res = utils.get_user_profile()
    return jsonify({'message': res})


@app.route('/getorders')
def get_orders():
    res = utils.get_orders()
    print('res ->', res)
    return jsonify({'message': res})


@app.route('/getpositions')
def get_positions():
    res = utils.get_positions()
    print('res ->', res)
    return jsonify({'message': res})


@app.route('/getoptionsstrikeprice')
def get_options_strike_price():
    res = utils.get_option_strike_price()
    return jsonify({'message': res})


@app.route('/get_algotrade_data')
def get_algotrade_data():
    # Replace with your logic to generate the data
    data = {
        'suggested_direction': 'long',
        'direction': 'Call',
        'exit_the_trade': False
    }
    return jsonify(data)


@app.route('/placeoptionorder')
def place_option_order():
    # Retrieve query parameters from the URL
    symbol = request.args.get('symbol', '').strip()
    exp_dt = request.args.get('expDate', '').strip()
    option_symbol = request.args.get('optionSymbol', '').strip()
    qty = request.args.get('qty', '1').strip()
    side_select = request.args.get('sideSelect', '').strip()
    type_select = request.args.get('typeSelect', '').strip()
    duration_select = request.args.get('durationSelect', '').strip()
    price = request.args.get('price', '').strip()
    stop = request.args.get('stop', '').strip()

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


@app.route('/placealgoorder')
def place_algo_order():
    # Retrieve query parameters from the URL
    symbol = request.args.get('symbol', '').strip()
    exp_dt = request.args.get('expDate', '').strip()
    option_symbol = request.args.get('optionSymbol', '').strip()
    qty = request.args.get('qty', '1').strip()
    side_select = request.args.get('sideSelect', '').strip()
    type_select = request.args.get('typeSelect', '').strip()
    duration_select = request.args.get('durationSelect', '').strip()
    price = request.args.get('price', '').strip()
    stop = request.args.get('stop', '').strip()

    # print('symbol -> ', qty)

    res = automate.place_algo_order(
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
    # print('some_func -> ', some_func)
    return jsonify({'message': res})


@app.route('/cancelorder')
def cancel_option_order():
    order_id = request.args.get('order_id')
    res = utils.cancel_order(order_id=order_id)
    return jsonify({'message': res})


@app.route('/timesales')
def time_sales():
    symbol = request.args.get('symbol')
    startDate = request.args.get('startDate')
    endDate = request.args.get('startDate')
    interval = request.args.get('intervalSelect')
    res = utils.get_time_sales(symbol, interval, startDate, endDate, 'e')
    return jsonify({'message': res})


@app.route('/modifyorder')
def modify_order():
    order_id = request.args.get('orderId')
    type = request.args.get('type')
    duration = request.args.get('duration')
    price = request.args.get('modifyPrice')
    stop = request.args.get('modifyStop')
    res = utils.modify_order(order_id, type, duration, price, stop)
    return jsonify({'message': res})


@app.route('/balances')
def get_balances():
    res = utils.get_balances()
    return jsonify({'message': res})


@app.route('/gainloss')
def get_gain_loss():
    res = utils.get_gain_loss()
    return jsonify({'message': res})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
