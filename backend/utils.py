import config
import requests
import json
import pandas as pd


headers = {
    'Authorization': 'Bearer {}'.format(config.SANDBOX_ACCESS_TOKEN),
    'Accept': 'application/json'
}
live_headers = {
    'Authorization': 'Bearer {}'.format(config.ACCESS_TOKEN),
    'Accept': 'application/json'
}

order_url = '{}accounts/{}/orders'.format(
    config.API_BASE_URL, config.SANDBOX_ACCOUNT_NUMBER)


def get_quotes(symbols='TSLA') -> dict:
    url = "{}markets/quotes".format(config.API_BASE_URL)

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


def get_options_chain(symbol='TSLA', exp_dt='2023-07-28', option_type=None):
    options_url = '{}markets/options/chains'.format(config.API_BASE_URL)

    response = requests.get(options_url,
                            params={'symbol': symbol, 'expiration': exp_dt},
                            headers=headers
                            )

    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()

    if option_type is not None:
        filtered_options = [option for option in data_dict['options']
                            ['option'] if option['option_type'] == option_type]
        data_dict['options']['option'] = filtered_options

        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return {'message': f'Failed to retrieve data status code: {response.status_code}'}

# print(get_options_chain())


def get_option_strike_price(symbol='TSLA', exp_dt='2023-07-28') -> dict:
    strikes_url = '{}markets/options/strikes'.format(config.API_BASE_URL)

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
                    str(response.text)
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
            f'{config.API_BASE_URL}accounts/{config.SANDBOX_ACCOUNT_NUMBER}/orders/{order_id}',
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
            f'{config.API_BASE_URL}accounts/{config.SANDBOX_ACCOUNT_NUMBER}/orders/{order_id}',
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
        response = requests.get(f'{config.API_BASE_URL}accounts/{config.SANDBOX_ACCOUNT_NUMBER}/positions',
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
        response = requests.get(f'{config.LIVE_API_BASE_URL}markets/timesales',
                                params={'symbol': symbol, 'interval': interval,
                                        'start': f'{start} 09:30', 'end': f'{end} 16:00',
                                        'session_filter': 'all'},
                                headers=live_headers
                                )
        if response.ok:
            json_response = response.json()
            return json_response
        print(response.status_code, response.text)
        print(json_response)
    except Exception as e:
        print('could not place order', e)
        return {'exception':
                [
                    'There are invalid params',
                    f'could not get',
                    f'{e}']}


# print(get_time_sales('a','b','c','d','e'))

def get_user_profile() -> dict:
    try:
        response = requests.get(f'{config.API_BASE_URL}user/profile',
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
        response = requests.get(f'{config.API_BASE_URL}accounts/{config.SANDBOX_ACCOUNT_NUMBER}/balances',
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
        response = requests.get(f'{config.API_BASE_URL}accounts/{config.SANDBOX_ACCOUNT_NUMBER}/gainloss',
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
