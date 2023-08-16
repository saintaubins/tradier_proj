
from flask import Flask, jsonify, request, render_template, Response
from flask_cors import CORS
import utils
import automate
import socketio
import eventlet
import time
from flask_socketio import SocketIO
import logging
# from flask_sse import sse
# from flask_socketio import SocketIO


# app = Flask(__name__)
# socket_io = socketio.SocketIO(app, cors_allowed_origins="*", logger=True)

allowed_origins = ['http://localhost:8000', 'https://main--shimmering-jelly-900e3e.netlify.app',
                   'https://tradier-app-b7ceb132d0e1.herokuapp.com']

app = Flask(__name__)

# socket_io = SocketIO(app, cors_allowed_origins=[
#                      'http://localhost:8000', 'https://main--shimmering-jelly-900e3e.netlify.app', 'https://tradier-app-b7ceb132d0e1.herokuapp.com', '*'])

# Initialize CORS with the allowed origins
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# Initialize your SocketIO app
socket_io = SocketIO(app)

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - {%(pathname)s:%(lineno)d} - %(levelname)s - %(message)s')


@app.route('/')
def index():
    return jsonify({'message': 'Hello, Flask!'})


@app.route('/automation_events', methods=['GET', 'POST'])
def automation_events():
    def generate_events():
        while True:
            # Generate or fetch the updated data here
            message = automate.post_message()
            response_data = {
                "data": message
            }
            response = f"data: {response_data}\n"
            response += f"Access-Control-Allow-Origin: https://main--shimmering-jelly-900e3e.netlify.app\n\n"
            yield response
            time.sleep(10)

    return Response(generate_events(), content_type='text/event-stream')


# @app.route('/')
# def index():
#     return render_template('Automate.html')  # Your frontend HTML file


# @socket_io.on('connect')
# def handle_connect():
#     app.logger.info('Client connected')
#     print('Client connected')
#     socket_io.emit('message', {'data': 'Hello from backend'})


@app.route('/optionschain', methods=['GET', 'POST'])
def options_chain():
    # Retrieve query parameters from the URL
    symbol = request.args.get('symbol', 'TSLA')
    exp_dt = request.args.get('exp_dt', '2023-07-28')
    # Retrieve the option_type query parameter
    option_type = request.args.get('optionType')

    # Get the options data based on the provided parameters
    res = utils.get_options_chain(
        symbol=symbol, exp_dt=exp_dt, option_type=option_type)
    app.logger.debug(
        f'Just sent options chain length of: {len(res["options"]["option"])}')
    return jsonify({'message': res})


@app.route('/getquotes', methods=['GET', 'POST'])
def get_quotes():
    res = utils.get_quotes()
    return jsonify({'message': res})


@app.route('/user/profile', methods=['GET', 'POST'])
def get_user_profile():
    res = utils.get_user_profile()
    return jsonify({'message': res})


@app.route('/getorders', methods=['GET', 'POST'])
def get_orders():
    res = utils.get_orders()
    print('res ->', res)
    return jsonify({'message': res})


@app.route('/getpositions', methods=['GET', 'POST'])
def get_positions():
    res = utils.get_positions()
    print('res ->', res)
    return jsonify({'message': res})


@app.route('/getoptionsstrikeprice', methods=['GET', 'POST'])
def get_options_strike_price():
    res = utils.get_option_strike_price()
    return jsonify({'message': res})


@app.route('/get_algotrade_data', methods=['GET', 'POST'])
def get_algotrade_data():
    # Replace with your logic to generate the data
    data = {
        'suggested_direction': 'long',
        'direction': 'Call',
        'exit_the_trade': False
    }
    return jsonify(data)


@app.route('/placeoptionorder', methods=['GET', 'POST'])
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


@app.route('/placealgoorder', methods=['GET', 'POST'])
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

    print('symbol -> ', qty)

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

    response_data = {'message': res}
    response = jsonify(response_data)
    response.headers.add("Access-Control-Allow-Origin",
                         "https://main--shimmering-jelly-900e3e.netlify.app")
    return response


@app.route('/cancelorder', methods=['GET', 'POST'])
def cancel_option_order():
    order_id = request.args.get('order_id')
    res = utils.cancel_order(order_id=order_id)
    return jsonify({'message': res})


@app.route('/timesales', methods=['GET', 'POST'])
def time_sales():
    symbol = request.args.get('symbol')
    startDate = request.args.get('startDate')
    endDate = request.args.get('endDate')
    interval = request.args.get('intervalSelect')
    res = utils.get_time_sales(symbol, interval, startDate, endDate, 'e')
    print('res ->', res)
    return jsonify({'message': res})


@app.route('/modifyorder', methods=['GET', 'POST'])
def modify_order():
    order_id = request.args.get('orderId')
    type = request.args.get('type')
    duration = request.args.get('duration')
    price = request.args.get('modifyPrice')
    stop = request.args.get('modifyStop')
    res = utils.modify_order(order_id, type, duration, price, stop)
    return jsonify({'message': res})


@app.route('/balances', methods=['GET', 'POST'])
def get_balances():
    res = utils.get_balances()
    return jsonify({'message': res})


@app.route('/gainloss', methods=['GET', 'POST'])
def get_gain_loss():
    res = utils.get_gain_loss()
    return jsonify({'message': res})


# if __name__ == '__main__':
    # app.run(debug=True, port=5001)
    # from eventlet import wsgi
    # app.run(host='0.0.0.0', port=5001)
    # wsgi.server(eventlet.listen(('0.0.0.0', 5001)), app)

if __name__ == '__main__':
    # Change port number if needed
    # socket_io.run(app, host='0.0.0.0', port=5001)
    app.run(debug=True, port=5001)
