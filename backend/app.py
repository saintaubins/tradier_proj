
from flask import Flask, jsonify, request, render_template, Response
from flask_cors import CORS
import utils
import automate
import socketio
import eventlet
import time
from flask_socketio import SocketIO
import logging
import json
import os
# from sseclient import EventSource
import threading


environment = os.environ.get('LOGNAME', 'production')

if environment == 'semsaint-aubin':
    allowed_origin = 'http://localhost:8000'

else:
    allowed_origin = 'https://shimmering-jelly-900e3e.netlify.app'


allowed_origins = [allowed_origin]

app = Flask(__name__)

app.config['TIMEOUT'] = 60

socket_io = SocketIO(cors_allowed_origins=[allowed_origin])

# Initialize CORS with the allowed origins
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# Initialize your SocketIO app
# socket_io = SocketIO(app)

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - {%(pathname)s:%(lineno)d} - %(levelname)s - %(message)s')


# MAX_CONNECTIONS = 6  # Maximum number of open SSE connections


# class ConnectionPool:
#     def __init__(self):
#         self.connections = []
#         self.lock = threading.Lock()

#     def get_connection(self):
#         with self.lock:
#             if len(self.connections) < MAX_CONNECTIONS:
#                 connection = EventSource('/automation_events')
#                 self.connections.append(connection)
#                 return connection
#             else:
#                 return None

#     def return_connection(self, connection):
#         with self.lock:
#             self.connections.remove(connection)
#             connection.close()


@app.route('/')
def index():
    return jsonify({'message': 'Hello, Flask!'})


@app.route('/automation_events', methods=['OPTIONS'])
def handle_preflight():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin

    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/automation_events', methods=['GET', 'POST'])
def automation_events():
    def generate_events():
        while True:
            # Generate or fetch the updated data here
            # message = automate.post_message()
            message = automate.update_status
            response = f"data: {json.dumps(message)}\n\n"
            response += f"Access-Control-Allow-Origin: {allowed_origin}\n\n"
            # print('response -> ', response)
            # app.logger.debug(f'response from automation events-> {response}')
            app.logger.debug(
                f'message from automation events-> {message["option_symbol"]}')
            yield response
            time.sleep(5)

    return Response(generate_events(), content_type='text/event-stream')


@app.route('/optionschain', methods=['OPTIONS'])
def handle_preflight1():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


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


@app.route('/getquotes', methods=['OPTIONS'])
def handle_preflight2():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/getquotes', methods=['GET', 'POST'])
def get_quotes():
    res = utils.get_quotes()
    app.logger.debug(f'result from get quotes-> {res}')
    return jsonify({'message': res})


@app.route('/user/profile', methods=['OPTIONS'])
def handle_preflight3():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/user/profile', methods=['GET', 'POST'])
def get_user_profile():
    res = utils.get_user_profile()
    app.logger.debug(f'result from user profile-> {res}')
    return jsonify({'message': res})


@app.route('/getorders', methods=['OPTIONS'])
def handle_preflight4():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/getorders', methods=['GET', 'POST'])
def get_orders():
    res = utils.get_orders()
    print('res ->', res)
    app.logger.debug(f'result from get orders-> {res}')
    return jsonify({'message': res})


@app.route('/getpositions', methods=['OPTIONS'])
def handle_preflight5():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/getpositions', methods=['GET', 'POST'])
def get_positions():
    res = utils.get_positions()
    app.logger.debug(f'result from get positions-> {res}')
    return jsonify({'message': res})


@app.route('/getoptionsstrikeprice', methods=['GET', 'POST'])
def get_options_strike_price():
    res = utils.get_option_strike_price()
    app.logger.debug(f'result from get options strike prices-> {res}')
    return jsonify({'message': res})


# @app.route('/get_algotrade_data', methods=['GET', 'POST'])
# def get_algotrade_data():

#     data = {
#         'suggested_direction': 'long',
#         'direction': 'Call',
#         'exit_the_trade': False
#     }
#     return jsonify(data)


@app.route('/placeoptionorder', methods=['OPTIONS'])
def handle_preflight6():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


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
    app.logger.debug(f'result from place option order-> {res}')
    return jsonify({'message': res})


@app.route('/placealgoorder', methods=['OPTIONS'])
def handle_preflight7():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/placealgoorder', methods=['GET', 'POST'])
def place_algo_order():
    logging.info(f"###########place algo order#######################")
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

    allowed_origins = [
        "https://shimmering-jelly-900e3e.netlify.app",  # Add your allowed origins here
        "http://localhost:8000"
    ]
    origin = request.headers.get("Origin")

    if origin in allowed_origins:
        response.headers.add("Access-Control-Allow-Origin", origin)

    app.logger.debug(f'response from place algo order-> {response}')

    return response


@app.route('/figure_it_out', methods=['OPTIONS'])
def handle_preflight8():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    logging.info(
        f"###########figure it out preflight#########{origin}##############")
    print(f'########################################{origin}##')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/figure_it_out', methods=['GET', 'POST'])
def figure_it_out():
    logging.info(f"###########figure it out#######################")
    print('##########################################')
    loop_the_trend = request.args.get('loopTheTrend')
    logging.info(f'loop the trend################## {loop_the_trend}')
    first_call = request.args.get('firstCall')
    logging.info(f'first_call#### {first_call}')
    current_trade_str = request.args.get('currentTrade')
    logging.info(f'current_trade_str############### {current_trade_str}')
    current_trade_str = current_trade_str.replace("'", "\"")
    logging.info(f'current_trade_str############### {current_trade_str}')
    current_trade = json.loads(current_trade_str)
    logging.info(f'current_trade###### {current_trade}')
    try:

        # current_trade = current_trade
        print('*******************look here**************')
        print('current_trade -> ', current_trade)

        res = automate.figure_it_out(
            d=current_trade, loop_the_trend=loop_the_trend, first_call=first_call)

        print('res from figure it out ->', res)

        response_data = {'message': res}
        response = jsonify(response_data)

        allowed_origins = [
            "https://shimmering-jelly-900e3e.netlify.app",  # Add your allowed origins here
            "http://localhost:8000"
        ]
        origin = request.headers.get("Origin")

        print('**********origin*************', origin)

        if origin in allowed_origins:
            response.headers.add("Access-Control-Allow-Origin", origin)

        app.logger.debug(f'response from figure it out-> {response}')

        return response
    except Exception as e:
        app.logger.debug(f'Exception from figure it out-> {e}')
        return jsonify({'error from current_trade': f'{e}'})


@app.route('/cancelorder', methods=['OPTIONS'])
def handle_preflight9():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/cancelorder', methods=['GET', 'POST'])
def cancel_option_order():
    order_id = request.args.get('order_id')
    res = utils.cancel_order(order_id=order_id)
    app.logger.debug(f'result from cancel order-> {res}')
    return jsonify({'message': res})


@app.route('/timesales', methods=['OPTIONS'])
def handle_preflight10():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/timesales', methods=['GET', 'POST'])
def time_sales():
    symbol = request.args.get('symbol')
    startDate = request.args.get('startDate')
    endDate = request.args.get('endDate')
    interval = request.args.get('intervalSelect')
    res = utils.get_time_sales(symbol, interval, startDate, endDate, 'e')
    print('response from times sales working, app.py')
    app.logger.debug(f'res from time sales 👋 Data has been sent! 😀')
    return jsonify({'message': res})


@app.route('/modifyorder', methods=['OPTIONS'])
def handle_preflight11():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/modifyorder', methods=['GET', 'POST'])
def modify_order():
    order_id = request.args.get('orderId')
    type = request.args.get('type')
    duration = request.args.get('duration')
    price = request.args.get('modifyPrice')
    stop = request.args.get('modifyStop')
    res = utils.modify_order(order_id, type, duration, price, stop)
    app.logger.debug(f'res from modify order')
    return jsonify({'message': res})


@app.route('/balances', methods=['OPTIONS'])
def handle_preflight12():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/balances', methods=['GET', 'POST'])
def get_balances():
    res = utils.get_balances()
    return jsonify({'message': res})


@app.route('/gainloss', methods=['OPTIONS'])
def handle_preflight13():
    # Respond to the preflight request with appropriate CORS headers
    response = app.make_default_options_response()
    allowed_origins = [
        'https://shimmering-jelly-900e3e.netlify.app',
        'http://localhost:8000'  # Add your second allowed origin here
    ]

    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    # Specify allowed headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/gainloss', methods=['GET', 'POST'])
def get_gain_loss():
    res = utils.get_gain_loss()
    app.logger.debug(f'res from gain loss 👋 data has been sent! 😀')
    return jsonify({'message': res})


if __name__ == '__main__':
    # Change port number if needed
    # socket_io.run(app, host='0.0.0.0', port=5001)
    app.run(debug=True, port=5001)
