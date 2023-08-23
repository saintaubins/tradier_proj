
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
    'option_type': 'tbd'
}


def set_current_trade(option_symbol: str, qty: str) -> dict:
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

    print('current_trade -> ', current_trade)
    logging.info(f"current_trade -> {current_trade}")
    return current_trade


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
            set_current_trade(option_symbol, qty)
            success_dict = {
                'success': [
                    str(response.text),
                    ('loop_the_trend ', loop_the_trend),
                    ('current trade', current_trade)
                ]
            }
            logging.info(f"success_dict -> {success_dict}")

            # figure_it_out(curr_trade, loop_the_trend)

            return success_dict

    except Exception as e:
        print('could not place algo order', e)
        return {'exception':
                [
                    'Something went wrong',
                    f'could not place algo order',
                    f'{e}', 'This will also happen off market hours, a holiday, or a weekend.']}


def get_today_date():
    today = date.today()
    return today.strftime("%Y-%m-%d")


def get_market_trend(d: dict) -> dict:
    # print('symbol -> ', d.get('symbol'))
    symbol = d.get('symbol', 'no symbol')
    interval = '15min'
    session_filter = 'all'
    start = get_today_date()
    end = get_today_date()

    data = utils.get_time_sales(symbol, interval, start, end, session_filter)

    return data


def monitor_the_trade(d: dict) -> bool:

    data = get_market_trend(d)

    # Get the data array from the dataset
    data_array = data['series']['data']
    # print('data_array -> ', data_array)

    # Calculate EMA1 and EMA7 for close prices
    ema1 = calculate_EMA(data_array, 1)
    ema7 = calculate_EMA(data_array, 7)
    # period = 7
    # ema1_values, ema7_values, current_price_values = calculate_EMA(
    #     data_array)
    print('ema1_values ->', ema1[-1])
    print('ema7_values ->', ema7[-1])
    # print('current_price_values ->', data_array)
    # print('time_values ->', data_array)

    # return ema1, ema7
    return ema1, ema7,  data_array


def calculate_EMA(data, period):
    ema_array = []
    smoothing_factor = 2 / (period + 1)

    # Calculate the EMA 1 (no need for looping)
    ema_array.append(data[0]['close'])

    # Calculate the EMA 7
    for i in range(1, len(data)):
        ema = (data[i]['close'] * smoothing_factor) + \
            (ema_array[i - 1] * (1 - smoothing_factor))
        ema_array.append(ema)

    return ema_array


status = {
    'suggested_direction': 'tbd',
    'direction': 'tbd',
    'exit_the_trade': 'tbd',
    'loop_the_trend': 'tbd',
    'ema1': 'tbd',
    'ema7': 'tbd',
    'curr_price': 'tbd',
    'option_symbol': 'tbd'
}


def update_status(suggested_direction, direction, exit_the_trade, loop_the_trend, ema1, ema7, curr_price, option_symbol):
    global status
    status['suggested_direction'] = suggested_direction
    status['direction'] = direction
    status['exit_the_trade'] = exit_the_trade
    status['loop_the_trend'] = loop_the_trend
    status['ema1'] = ema1
    status['ema7'] = ema7
    status['curr_price'] = curr_price
    status['option_symbol'] = option_symbol


def figure_it_out(d: dict, loop_the_trend: bool):
    try:

        exit_the_trade = False
        suggested_direction = ''
        option_symbol = d.get('option_symbol', 'no symbol')
        direction = d.get('option_type', 'no direction')
        qty = d.get('qty', 'no qty')
        side = d.get('side', 'no side')
        t_type = d.get('type', 'no type')
        duration = d.get('duration', 'no duration')
        logging.info(f"option_symbol:{option_symbol}, direction:{direction}")
        while loop_the_trend:
            # for _ in range(2):
            ema1, ema7, curr_price = monitor_the_trade(d)
            logging.info(f"ema1:{ema1[-1]}, ema7:{ema7[-1]}")
            if ema1[-1] > ema7[-1]:
                suggested_direction = 'long'
            if ema1[-1] < ema7[-1]:
                suggested_direction = 'short'
            if direction == 'Call' and suggested_direction == 'short':
                exit_the_trade = True
            if direction == 'Put' and suggested_direction == 'long':
                exit_the_trade = True
            if exit_the_trade == True:
                loop_the_trend = False
                print('time to exit, we should have a profit')
                update_status(suggested_direction, direction,
                              exit_the_trade, loop_the_trend, ema1, ema7, curr_price, option_symbol)

                # place code to exit the trade
                res = utils.place_option_order(
                    '', '', option_symbol, qty, side, t_type, duration, '', '')
                message = {
                    'm': 'time to exit, we should have a profit',
                    'res': f'{res}'
                }
                return message
            else:
                logging.info(
                    f"option_symbol:{option_symbol}, direction:{direction}got this far")
                loop_the_trend = True
                print('good time to be in a trade')
                print('suggested_direction', suggested_direction)
                print('direction -> ', direction)
                print('exit_the_trade', exit_the_trade)
                print('loop_the_trend', loop_the_trend)
                print('ema1 ->', ema1[-1])
                print('ema7 ->', ema7[-1])
                print('curr_price ->', curr_price[-1])
                logging.info(
                    f"curr_price:{curr_price[-1]}")
                print('option_symbol ->', option_symbol)

                # global message
                update_status(suggested_direction, direction,
                              exit_the_trade, loop_the_trend, ema1, ema7, curr_price, option_symbol)

            time.sleep(10)

        return message
    except Exception as e:
        logging.info(f'something went wrong with automation: {e}')
        print(f'something went wrong with automation: {e} ')


def post_message() -> str:
    # print('from post_message the is status -> ', status)
    logging.info(f'from post_message the is status -> {status}')
    return status  # Serialize the message dictionary as JSON
