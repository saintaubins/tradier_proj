
import requests
import json
import os
import logging
import calc_pop
from datetime import datetime

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - {%(pathname)s:%(lineno)d} - %(levelname)s - %(message)s')

environment = os.environ.get('LOGNAME', 'production')
# print('environment -> ', environment)
# print('os env -> ', os.environ.get('LOGNAME'))
if environment == 'semsaint-aubin':
    import config
    access_token = config.ACCESS_TOKEN
    account_id = config.ACCOUNT_ID
    api_base_url = config.API_BASE_URL
    live_api_base_url = config.LIVE_API_BASE_URL
    sandbox_access_token = config.SANDBOX_ACCESS_TOKEN
    sandbox_account_number = config.SANDBOX_ACCOUNT_NUMBER
    # print('environment -> ', environment)

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
live_headers = {
    'Authorization': 'Bearer {}'.format(access_token),
    'Accept': 'application/json'
}

order_url = '{}accounts/{}/orders'.format(
    api_base_url, sandbox_account_number)


def get_quotes(symbols='TSLA') -> dict:
    url = "{}markets/quotes".format(api_base_url)

    response = requests.get(url,
                            params={'symbols': symbols},
                            headers=headers
                            )
    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()

        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return {'message: ': f'Failed to retrieve data. Status code: {response.status_code}'}

# print(get_quotes())


def com_days_to_exp(s: str) -> str:
    # Expiration date in 'YYYY-MM-DD' format
    expiration_date_str = s

    # Convert the expiration date string to a datetime object
    expiration_date = datetime.strptime(expiration_date_str, '%Y-%m-%d')

    # Get the current date as a datetime object
    current_date = datetime.now()

    # Calculate the difference (timedelta) between expiration date and current date
    time_difference = expiration_date - current_date

    # Extract the number of days from the timedelta
    days_to_expiration = time_difference.days

    print(f'Days to Expiration: {days_to_expiration+1} days')
    return days_to_expiration + 1


def get_options_chain(symbol='TSLA', exp_dt='2023-09-15', option_type=None):
    options_url = '{}markets/options/chains'.format(api_base_url)

    response = requests.get(options_url,
                            params={'symbol': symbol, 'expiration': exp_dt},
                            headers=headers
                            )

    stock_prc = get_quotes(symbol)  # Current stock price
    stock_price = stock_prc['quotes']['quote']['last']
    days_to_expiration = com_days_to_exp(exp_dt)
    # option_type = option_type

    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()

    if option_type is not None:
        filtered_options = [option for option in data_dict['options']
                            ['option'] if option['option_type'] == option_type]
        data_dict['options']['option'] = filtered_options

        # print('data_dict: ', data_dict)
        # stock_price = 1
        # Option's strike price
        # bid = data_dict['options']['option'][0]['bid']
        # ask = data_dict['options']['option'][0]['ask']
        # strike_price = data_dict['options']['option'][0]['strike']
        # market_price = (bid + ask)/2  # The market price of the option
        # print('strike_price: ', strike_price)
        # days_to_expiration = calc_pop.com_days_to_exp()  # Days to option expiration
        # # implied_volatility = 0.2  # Implied volatility as a decimal (20%)
        # option_type = option_type  # 'call' or 'put'

        for i in range(len(data_dict['options']['option'])):
            bid = data_dict['options']['option'][i]['bid']
            ask = data_dict['options']['option'][i]['ask']
            strike_price = data_dict['options']['option'][i]['strike']
            market_price = (bid + ask)/2

            iv = calc_pop.implied_volatility(option_type, stock_price,
                                             strike_price, days_to_expiration, market_price)
            pop = calc_pop.calculate_pop(stock_price, strike_price,
                                         days_to_expiration, iv, option_type)

            data_dict['options']['option'][i]['iv'] = iv
            data_dict['options']['option'][i]['pop'] = pop

            # print('bid', bid, 'ask', ask, 'strike_price',
            #       strike_price, 'iv', iv, 'pop', pop)
        # print(data_dict)
        # if type(pop) != str:
        #     print(f"Probability of Profit (POP): {pop:.2%}")
        #     print(f"Implied Volatility: {iv:.4f}")
        # else:
        #     print(f"Probability of Profit (POP): {pop}")
        #     print(f"Implied Volatility: {iv}")

        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return {'message': f'Failed to retrieve data status code: {response.status_code}'}


# print(get_options_chain('spy', '2023-09-18', 'call'))


def get_option_strike_price(symbol='TSLA', exp_dt='2023-07-28') -> dict:
    strikes_url = '{}markets/options/strikes'.format(api_base_url)

    response = requests.get(strikes_url,
                            params={'symbol': symbol, 'expiration': exp_dt},
                            headers=headers
                            )

    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()

        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return {'message: ': f'Failed to retrieve data. Status code: {response.status_code}'}

# print(get_option_strike_price())


def place_option_order(
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
            print('response.text -> ', response.text)
            success_dict = {
                'success': [
                    str(response.text),
                    str(response.status_code)
                ]
            }
            return success_dict

    except Exception as e:
        print('could not place order', e)
        return {'exception':
                [
                    'There is invalid data',
                    f'could not place order',
                    f'{e}']}

# print(place_option_order())


def sell_option_order(symbol='TSLA', option_symbol='TSLA230728P00020000', qty='5') -> dict:
    try:
        response = requests.post(
            order_url,
            data={
                'class': 'option',
                'symbol': symbol,
                'option_symbol': option_symbol,
                'side': 'sell_to_close',
                'quantity': qty,
                'type': 'market',
                'duration': 'day'},
            headers=headers
        )
        return response.json()
    except Exception as e:
        print(f'could not sell order Error: {e}')
        return {'message: ': f'could not sell order Error: {e}'}


def cancel_order(order_id: str) -> dict:
    try:
        response = requests.delete(
            f'{api_base_url}accounts/{sandbox_account_number}/orders/{order_id}',
            headers=headers
        )
        print('response.status_code', response.status_code)
        if response.status_code == 200:
            if response.text == 'order already in finalized state: filled':
                return {'message': 'order already in finalized state: filled'}
            else:
                return response.json()
        else:
            return {'message': f'Failed to retrieve data.',
                    'response_status_code': f'{response.status_code}',
                    'response_text': f'{response.text}',
                    'response_content': f'{response.content}',
                    'response_is_permanent_redirect': f'{response.is_permanent_redirect}',
                    'response_ok': f'{response.ok}',
                    }
    except Exception as e:
        print('error -> ', e)
        return {'message': f'Failed to retrieve data. Error: {e}'}

# cancel_order('7200241')


def modify_order(order_id: str, type: str, duration: str, price: str, stop: str) -> dict:
    try:
        response = requests.put(
            f'{api_base_url}accounts/{sandbox_account_number}/orders/{order_id}',
            data={'type': type,
                  'duration': duration,
                  'price': price,
                  'stop': stop
                  },
            headers=headers
        )
        if response.ok:
            json_response = response.json()
            # print('response.text -> ', response.text)
            # print('response.status_code -> ', response.status_code)
            # print('message', f'Failed to retrieve data.')
            # print('response_status_code', f'{response.status_code}')
            # print('response_text', f'{response.text}')
            # print('response_content', f'{response.content}')
            # print('response_is_permanent_redirect',
            #     f'{response.is_permanent_redirect}')
            # print('response_ok', f'{response.ok}')
            return json_response
    except Exception as e:
        print('could not modify order', e)
        return {'exception':
                [
                    'Something went wrong',
                    f'could not modify order',
                    f'{e}']}

# modify_order('7169581')


def get_orders() -> dict:
    response = requests.get(order_url, headers=headers)
    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()
        # print('data_dict -> ', data_dict)
        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return {'message: ': f'Failed to retrieve data. Status code:' + response.status_code}

# print(get_orders())


def get_positions() -> dict:
    try:
        response = requests.get(f'{api_base_url}accounts/{sandbox_account_number}/positions',
                                params={},
                                headers=headers
                                )
        if response.ok:
            json_response = response.json()
            # print(response.status_code)
            # print(json_response)
            return json_response

    except Exception as e:
        print('could not get positions', e)
        return {'exception':
                [
                    'Something went wrong',
                    f'could not get positions',
                    f'{e}']}


def get_time_sales(symbol: str, interval: str, start: str, end: str, session_filter: str) -> dict:
    try:
        response = requests.get(f'{live_api_base_url}markets/timesales',
                                params={'symbol': symbol, 'interval': interval,
                                        'start': f'{start}', 'end': f'{end} 24:00',
                                        'session_filter': 'all'},
                                headers=live_headers
                                )
        if response.ok and response.status_code != 400:
            json_response = response.json()
            print('successful response from utils.timesales', response.status_code)
            logging.info(
                f'good response from get time sales: {response.status_code}')
            return json_response
        else:
            logging.info(
                f'response status code not ok: {response.status_code}{response.text}')
            print('response.status_code not ok -> ', response.status_code,
                  'response.txt -> ', response.text)

            return {'res': str(response), 'status_code': response.status_code}

    except Exception as e:
        logging.info(f'Something went wrong with get time sales: {e}')
        print('could not place order', e)
        return {'exception':
                [response,
                    'There are invalid params',
                    f'could not get',
                    f'{e}']}


# print(get_time_sales('a','b','c','d','e'))

def get_user_profile() -> dict:
    try:
        response = requests.get(f'{api_base_url}user/profile',
                                params={},
                                headers=headers
                                )
        if response.ok:
            json_response = response.json()
            return json_response
    except Exception as e:
        print('could not get user profile', e)
        return {'exception':
                [
                    'Something went wrong',
                    f'could not get',
                    f'{e}']}


# get_user_profile()

def get_balances() -> dict:
    try:
        response = requests.get(f'{api_base_url}accounts/{sandbox_account_number}/balances',
                                params={},
                                headers=headers
                                )
        if response.ok:
            json_response = response.json()
            return json_response

    except Exception as e:
        print('could not get balances', e)
        return {'exception':
                [
                    'Something went wrong',
                    f'could not get',
                    f'{e}']}


# get_balances()

def get_gain_loss() -> dict:
    try:
        response = requests.get(f'{api_base_url}accounts/{sandbox_account_number}/gainloss',
                                params={'page': '', 'limit': '', 'sortBy': 'closeDate', 'sort': 'desc',
                                        'start': '', 'end': '', 'symbol': ''},
                                headers=headers
                                )
        if response.ok:
            json_response = response.json()
            return json_response
    except Exception as e:
        print('could not get gain loss', e)
        return {'exception':
                [
                    'Something went wrong',
                    f'could not get',
                    f'{e}']}


# get_gain_loss()
