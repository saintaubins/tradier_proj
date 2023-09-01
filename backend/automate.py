
import requests
import re
import utils
from datetime import date
import time
import threading
import queue
import os
import logging
import json
import asyncio

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - {%(pathname)s:%(lineno)d} - %(levelname)s - %(message)s')


environment = os.environ.get('LOGNAME', 'production')

if environment == 'semsaint-aubin':
    import config
    access_token = config.ACCESS_TOKEN
    account_id = config.ACCOUNT_ID
    api_base_url = config.API_BASE_URL
    live_api_base_url = config.LIVE_API_BASE_URL
    sandbox_access_token = config.SANDBOX_ACCESS_TOKEN
    sandbox_account_number = config.SANDBOX_ACCOUNT_NUMBER

else:
    access_token = os.environ.get('ACCESS_TOKEN')
    account_id = os.environ.get('ACCOUNT_ID')
    api_base_url = os.environ.get('API_BASE_URL')
    live_api_base_url = os.environ.get('LIVE_API_BASE_URL')
    sandbox_access_token = os.environ.get('SANDBOX_ACCESS_TOKEN')
    sandbox_account_number = os.environ.get('SANDBOX_ACCOUNT_NUMBER')


headers = {
    'Authorization': 'Bearer {}'.format(sandbox_access_token),
    'Accept': 'application/json'
}

order_url = '{}accounts/{}/orders'.format(
    api_base_url, sandbox_account_number)

# global vars
loop_the_trend = False
curr_trade = {}
exit_the_trade = False

current_trade = {
    'symbol': 'tbd',
    'option_symbol': 'tbd',
    'type': 'market',
    'side': 'sell_to_close',
    'qty': 'tbd',
    'duration': 'gtc',
    'option_type': 'tbd',
    'buy_price': 'tbd'
}


def set_current_trade(option_symbol: str, qty: str, buy_price: str) -> dict:
    try:
        option_t = get_option_type(option_symbol)
        option_s = extract_ticker_symbol(option_symbol)

        global current_trade
        current_trade['symbol'] = option_s
        current_trade['option_symbol'] = option_symbol
        current_trade['type'] = 'market'
        current_trade['side'] = 'sell_to_close'
        current_trade['qty'] = qty
        current_trade['duration'] = 'gtc'
        current_trade['option_type'] = option_t
        current_trade['buy_price'] = buy_price

        print('current_trade -> ', current_trade)
        logging.info(f"current_trade -> {current_trade}")
        return current_trade

    except Exception as e:
        print(f'Something went wrong in set current trade: {e}')
        logging.info(f'Something went wrong in set current trade: {e}')


def get_option_type(option_symbol):
    if re.search(r'\d+[C|c]', option_symbol):
        return 'Call'
    elif re.search(r'\d+[P|p]', option_symbol):
        return 'Put'
    else:
        return 'Unknown'


def extract_ticker_symbol(option_symbol):
    # Use regex to find the ticker symbol (characters before the first number)
    ticker_symbol = re.match(r'^\D+', option_symbol).group()
    return ticker_symbol


# global var
loop_the_trend = False


def set_loop_the_trend(b: bool):
    global loop_the_trend
    loop_the_trend = b


def place_algo_order(
    symbol: str,
    exp_dt: str,
    option_symbol: str,
    qty: str,
    side_select: str,
    type_select: str,
    duration_select: str,
    price: str,
    stop: str
) -> dict:

    try:
        # print('algo order symbol -> ', symbol)
        response = requests.post(
            order_url,
            data={
                'class': 'option',
                'symbol': symbol,
                'option_symbol': option_symbol,
                'side': side_select,
                'quantity': qty,
                'type': type_select,
                'duration': duration_select,
                'price': price,
                'stop': stop
            },
            headers=headers
        )
        if not response.ok:
            error_dict = {
                'exception': [
                    str(response.text),
                    str(response.reason),
                    'Error code: '+str(response.status_code)]}
            return error_dict
        else:
            print('algo response.text -> ', response.text)
            set_loop_the_trend(True)
            set_current_trade(option_symbol, qty, price)
            success_dict = {
                'success': [
                    str(response.text),
                    ('loop_the_trend ', loop_the_trend),
                    ('current trade', current_trade),
                    ('buy price', price)
                ]
            }
            logging.info(f"success_dict -> {success_dict}")

            return success_dict

    except Exception as e:
        print('could not place algo order', e)
        return {'exception':
                [
                    'Something went wrong in algo order',
                    f'could not place algo order',
                    f'{e}', 'This will also happen off market hours, a holiday, or a weekend.']}


def get_today_date():
    try:
        today = date.today()
        return today.strftime("%Y-%m-%d")
    except Exception as e:
        print(f'Something went wrong in get today date: {e}')
        logging.info(f'Something went wrong in get today date: {e}')


# async def get_market_trend(d: dict) -> dict:
def get_market_trend(d: dict) -> dict:
    try:
        logging.info('*******Inside get market trend********')
        symbol = d.get('symbol', 'no symbol')
        interval = '15min'
        session_filter = 'all'
        start = get_today_date()
        end = get_today_date()

        # data = None

        # while data is None:
        # data = await utils.get_time_sales(
        data = utils.get_time_sales(
            symbol, interval, start, end, session_filter)
        # await asyncio.sleep(3)
        # time.sleep(3)

        return data
    except Exception as e:
        print(f'Something went wrong in get market trend: {e}')
        logging.info(f'Something went wrong in get market trend: {e}')


def monitor_the_trade(d: dict):
    suggested_direction = ""

    try:
        logging.info('*******Inside monitor the trade****')
        # data = get_market_trend(d)
        data = get_market_trend(d)

        # Get the data array from the dataset
        data_array = data['series']['data']
        # print('data_array -> ', data_array)

        ################# Calculate EMA1 and EMA7 for close prices###########################
        ema1 = calculate_EMA(data_array, 3)
        ema7 = calculate_EMA(data_array, 7)
        # period = 7
        # ema1_values, ema7_values, current_price_values = calculate_EMA(
        #     data_array)
        print('ema1_values ->', ema1[-1])
        print('ema7_values ->', ema7[-1])
        # print('current_price_values ->', data_array)
        # print('time_values ->', data_array)
        if ema1[-1] > ema7[-1]:
            suggested_direction = 'long'
        else:
            suggested_direction = 'short'

        # return ema1, ema7
        return ema1, ema7, data_array, suggested_direction
    except Exception as e:
        print(f'Something went wrong in monitor trade: {e}')
        logging.info(f'Something went wrong in monitor trade: {e}')


def calculate_EMA(data, period):
    try:
        ema_array = []
        smoothing_factor = 2 / (period + 1)

        # Calculate the EMA 3 (no need for looping)
        ema_array.append(data[0]['close'])

        # Calculate the EMA 7
        for i in range(1, len(data)):
            ema = (data[i]['close'] * smoothing_factor) + \
                (ema_array[i - 1] * (1 - smoothing_factor))
            ema_array.append(ema)

        return ema_array
    except Exception as e:
        print(f'Something went wrong in ema calculation: {e}')
        logging.info(f'Something went wrong in ema calculation: {e}')


status = {
    "suggested_direction": "tbd",
    "direction": "tbd",
    "exit_the_trade": "tbd",
    "loop_the_trend": "tbd",
    "ema1": ["tbd"],
    "ema7": ["tbd"],
    "data_array": ["tbd"],
    "option_symbol": "tbd",
    "buy_price": "tbd"
}


def update_status(suggested_direction, direction, exit_the_trade, loop_the_trend, ema1, ema7, data_array, option_symbol, buy_price):
    global status
    try:
        status["suggested_direction"] = suggested_direction
        status["direction"] = direction
        status["exit_the_trade"] = exit_the_trade
        status["loop_the_trend"] = loop_the_trend
        status["ema1"] = ema1
        status["ema7"] = ema7
        status["data_array"] = data_array
        status["option_symbol"] = option_symbol
        status["buy_price"] = buy_price
        return status
    except Exception as e:
        print(f'Something went wrong in update status: {e}')
        logging.info(f'Something went wrong in update status: {e}')


def figure_it_out(d: dict, loop_the_trend: str, first_call: str):
    message = {}
    first_call = first_call.replace("'", " ")
    logging.info(f'<<<<<<<<<<<<<<first_call 289>>>>>>>>>>>>>>>: {first_call}')
    try:
        exit_the_trade = "False"
        suggested_direction = "dunno yet"
        option_symbol = d.get('option_symbol', 'no symbol')
        direction = d.get('option_type', 'no direction')
        qty = d.get('qty', 'no qty')
        side = d.get('side', 'no side')
        t_type = d.get('type', 'no type')
        duration = d.get('duration', 'no duration')
        buy_price = current_trade.get('buy_price')

        logging.info(
            f"option_symbol:{option_symbol}, direction:{direction}, first_call:{first_call}")
        if first_call == 'True':
            first_c = update_status(suggested_direction, direction,
                                    exit_the_trade, loop_the_trend, ['tbd'], ['tbd'], ['tbd'], option_symbol, buy_price)
            message = {
                'm': 'just placed the trade',
                'res': f'Good job',
                'first_c': f'{first_c}'
            }
            return message
        else:
            while loop_the_trend == "True":
                # for _ in range(2):
                ema1, ema7, data_array, suggested_direction = monitor_the_trade(
                    d)

                # global message
                update_stat = update_status(suggested_direction, direction,
                                            exit_the_trade, loop_the_trend, ema1, ema7, data_array, option_symbol, buy_price)

                # intermediate_message = {
                #     'm': 'Intermediate message',
                #     'res': 'Running calculations',
                #     'update_stat': f'{update_stat}'
                # }

                # yield intermediate_message

                logging.info(f"ema1:{ema1[-1]}, ema7:{ema7[-1]}")
                logging.info(
                    f'#########update_stat {update_stat["option_symbol"]}')
                # if ema1[-1] > ema7[-1]:
                #     suggested_direction = 'long'
                # if ema1[-1] < ema7[-1]:
                #     suggested_direction = 'short'
                if direction == 'Call' and suggested_direction == 'short':
                    exit_the_trade = "True"
                if direction == 'Put' and suggested_direction == 'long':
                    exit_the_trade = "True"
                if exit_the_trade == "True":
                    loop_the_trend = "False"
                    print('time to exit, we should have a profit')
                    update_status(suggested_direction, direction,
                                  exit_the_trade, loop_the_trend, ema1, ema7, data_array, f'{option_symbol}: sell order submitted', buy_price)

                    # place code to exit the trade
                    res = utils.place_option_order(
                        '', '', option_symbol, qty, side, t_type, duration, '', '')
                    message = {
                        'm': 'Time to exit, we should have a profit!',
                        'res': f'{res}'
                    }
                    return message
                else:
                    logging.info(
                        f"option_symbol:{option_symbol}, direction:{direction} got this far")
                    loop_the_trend = "True"
                    print('good time to be in a trade')
                    print('suggested_direction', suggested_direction)
                    print('direction -> ', direction)
                    print('exit_the_trade', exit_the_trade)
                    print('loop_the_trend', loop_the_trend)
                    print('ema1 ->', ema1[-1])
                    print('ema7 ->', ema7[-1])
                    # print('data_array ->', data_array[-1])
                    logging.info(
                        f"data_array: {data_array[-1]}")
                    # print('option_symbol ->', option_symbol)

                    # global message
                    update_status(suggested_direction, direction,
                                  exit_the_trade, loop_the_trend, ema1, ema7, data_array, option_symbol, buy_price)

                time.sleep(3)

    except Exception as e:
        logging.info(f'something went wrong with figure it out: {e}')
        print(f'something went wrong with figure it out: {e} ')


def post_message() -> dict:
    try:
        logging.info(
            f'👋 from post_message the is status data is being sent! {status["option_symbol"]}😀')
        return status
    except Exception as e:
        logging.info(f'error from post_massage -> {e}')
        print(f'error from post_message: {e}')
