
import requests
import re
import config
import utils
from datetime import date
import time
import threading
import queue

# 1. place trade.
# 2. if success capture the trade info from the trade.
# option_symbol, type, side, qty, duration.
# 3. create a constant loop to see market behavior, i.e. ema signal.
# 4. when signal says sell, call function to sell.
# 5 view trade on a graph.

headers = {
    'Authorization': 'Bearer {}'.format(config.SANDBOX_ACCESS_TOKEN),
    'Accept': 'application/json'
}

order_url = '{}accounts/{}/orders'.format(
    config.API_BASE_URL, config.SANDBOX_ACCOUNT_NUMBER)

loop_the_trend = False
curr_trade = {}
exit_the_trade = False


def set_current_trade(option_symbol: str, qty: str) -> dict:
    option_t = get_option_type(option_symbol)
    option_s = extract_ticker_symbol(option_symbol)

    current_trade = {
        'symbol': option_s,
        'option_symbol': option_symbol,
        'type': 'market',
        'side': 'sell_to_close',
        'qty': qty,
        'duration': 'gtc',
        'option_type': option_t
    }
    print('current_trade -> ', current_trade)
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
    loop_the_trend = False
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
            loop_the_trend = True
            curr_trade = set_current_trade(option_symbol, qty)
            success_dict = {
                'success': [
                    str(response.text),
                    ('loop_the_trend ', loop_the_trend),
                    # ('current trade', curr_trade.values())
                ]
            }
            # thread, result_queue = figure_it_out(curr_trade, result_queue)
            figure_it_out(curr_trade, loop_the_trend)
            # res = result_queue.get()
            # print('thread res -> ', res)
            return success_dict

    except Exception as e:
        print('could not place algo order', e)
        return {'exception':
                [
                    'Something went wrong',
                    f'could not place algo order',
                    f'{e}']}


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
    # time_to_exit = False

    data = get_market_trend(d)

    # print('monitor_the_trend -> ', data)

    # Get the data array from the dataset
    data_array = data['series']['data']

    # Calculate EMA1 and EMA7 for close prices
    ema1 = calculate_EMA(data_array, 1)
    ema7 = calculate_EMA(data_array, 7)

    return ema1, ema7


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


def figure_it_out(d: dict, loop_the_trend: bool):
    # creating a queue
    # result_queue = queue.Queue()

    # thread = threading.Thread(target=figure_it_out, args=(d, result_queue))
    # thread.start()

    exit_the_trade = False
    suggested_direction = ''
    option_symbol = d.get('option_symbol')
    direction = d.get('option_type', 'no direction')
    qty = d.get('qty')
    side = d.get('side')
    t_type = d.get('type')
    duration = d.get('duration')
    while loop_the_trend:
        # for _ in range(2):
        ema1, ema7 = monitor_the_trade(d)
        if ema1[-1] > ema7[-1]:
            suggested_direction = 'long'
        if ema1[-1] < ema7[-1]:
            suggested_direction = 'short'
        if direction == 'Call' and suggested_direction == 'short':
            exit_the_trade = True
        if direction == 'Put' and suggested_direction == 'long':
            exit_the_trade = True
        if exit_the_trade:
            loop_the_trend = False
            print('time to exit, we should have a profit')
            # place code to exit the trade
            res = utils.place_option_order(
                '', '', option_symbol, qty, side, t_type, duration, '', '')
        else:
            loop_the_trend = True
            print('good time to be in a trade')
        print('suggested_direction', suggested_direction)
        print('direction -> ', direction)
        print('exit_the_trade', exit_the_trade)
        print('loop_the_trend', loop_the_trend)
        print('ema1 ->', ema1[-1])
        print('ema7 ->', ema7[-1])
        time.sleep(15)

    # put the thread in the queue before returning
    # result_queue.put(res)

    return res
