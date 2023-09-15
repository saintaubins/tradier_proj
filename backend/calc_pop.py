import numpy as np
import math
# import utils
from scipy.stats import norm
from scipy.optimize import brentq
from scipy.stats import norm


def calculate_pop(stock_price, strike_price, days_to_expiration, implied_volatility, option_type):
    # Calculate d1 and d2 for Black-Scholes formula
    if option_type == 'call':
        option_type_factor = 1
    elif option_type == 'put':
        option_type_factor = -1
    else:
        raise ValueError("Option type must be 'call' or 'put'")

    if days_to_expiration <= 0:
        return f'expiration date: {days_to_expiration} days'
    else:
        # print('type(iv) -> ', type(implied_volatility))
        if isinstance(implied_volatility, (float, int)):
            d1 = (np.log(stock_price / strike_price) + ((0.5 * implied_volatility**2)
                                                        * days_to_expiration)) / (implied_volatility * np.sqrt(days_to_expiration))
            d2 = d1 - implied_volatility * np.sqrt(days_to_expiration)

            # Calculate the cumulative probability for d1 and d2
            cdf_d1 = norm.cdf(option_type_factor * d1)
            cdf_d2 = norm.cdf(option_type_factor * d2)

            # Calculate the probability of profit
            if option_type == 'call':
                pop = 1 - cdf_d1
            else:
                pop = cdf_d2

            return pop
        else:
            return f'calc error: type iv is not a valid numeric value'


# def calculate_option_price(stock_price, strike_price, days_to_expiration, implied_volatility, option_type, market_price):
#     # Implement your option pricing model (e.g., Black-Scholes) here
#     # Calculate and return the option price

#     # Constants
#     S = stock_price
#     K = strike_price
#     T = days_to_expiration / 365.0  # Convert days to years
#     r = 0.05  # Risk-free interest rate (adjust as needed)

#     # Calculate d1 and d2
#     d1 = (math.log(S / K) + (r + (implied_volatility**2) / 2) * T) / \
#         (implied_volatility * math.sqrt(T))
#     d2 = d1 - implied_volatility * math.sqrt(T)

#     if option_type == 'call':
#         # Calculate call option price
#         option_price = S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
#     elif option_type == 'put':
#         # Calculate put option price
#         option_price = K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
#     else:
#         raise ValueError("Option type must be 'call' or 'put'")

#     return option_price

def calculate_option_price(stock_price, strike_price, days_to_expiration, implied_volatility, option_type, market_price):
    # Constants
    S = stock_price
    K = strike_price
    T = days_to_expiration  # Convert days to years
    r = 0.05  # Risk-free interest rate (adjust as needed)

    # Check for valid implied_volatility
    if implied_volatility < 0:
        return 'Implied volatility must be a non-negative value.'
        raise ValueError("Implied volatility must be a non-negative value.")

    # Check for valid time to expiration
    if T <= 0:
        return 'Time to expiration must be greater than zero.'
        raise ValueError("Time to expiration must be greater than zero.")
    else:
        T = days_to_expiration / 365.0  # Convert days to years

        # Calculate d1 and d2
        d1 = (math.log(S / K) + (r + (implied_volatility**2) / 2) * T) / \
            (implied_volatility * math.sqrt(T))
        d2 = d1 - implied_volatility * math.sqrt(T)

        if option_type == 'call':
            # Calculate call option price
            option_price = S * norm.cdf(d1) - K * \
                math.exp(-r * T) * norm.cdf(d2)
        elif option_type == 'put':
            # Calculate put option price
            option_price = K * math.exp(-r * T) * \
                norm.cdf(-d2) - S * norm.cdf(-d1)
        else:
            raise ValueError("Option type must be 'call' or 'put'")

        return option_price


# def implied_volatility(option_type, stock_price, strike_price, days_to_expiration, market_price):
#     def f(volatility):
#         if (days_to_expiration > 0):
#             option_price = calculate_option_price(
#                 stock_price, strike_price, days_to_expiration, volatility, option_type, market_price)

#             return option_price - market_price
#         else:
#             return 'unable to compute IV'

#     try:
#         # Brent's method to find the implied volatility
#         # Adjust the range as needed
#         implied_volatility = brentq(f, 0.001, 10.0)
#         return implied_volatility
#     except ValueError as e:
#         return str(e)  # Return the error message as a string

def implied_volatility(option_type, stock_price, strike_price, days_to_expiration, market_price):
    if days_to_expiration <= 0:
        return f'Unable to compute IV: Days to expiration must be greater than 0. days: {days_to_expiration}'
        raise ValueError(
            'Unable to compute IV: Days to expiration must be greater than 0.')

    def f(volatility):
        option_price = calculate_option_price(
            stock_price, strike_price, days_to_expiration, volatility, option_type, market_price)

        return option_price - market_price

    try:
        # Brent's method to find the implied volatility
        # Adjust the range as needed
        implied_volatility = brentq(f, 0.001, 2.0)
        return implied_volatility
    except ValueError as e:
        return 'calc error: '+str(e)  # Return the error message as a string


# Example usage:
# stock_prc = utils.get_quotes('AAPL')  # Current stock price
# stock_price = stock_prc['quotes']['quote']['last']
strike_price = 105  # Option's strike price
days_to_expiration = 30  # Days to option expiration
# implied_volatility = 0.2  # Implied volatility as a decimal (20%)
option_type = 'call'  # 'call' or 'put'
market_price = 5.0  # The market price of the option

# iv = implied_volatility(option_type, stock_price,
#                         strike_price, days_to_expiration, market_price)

# pop = calculate_pop(stock_price, strike_price,
#                     days_to_expiration, iv, option_type)

# print(f"Probability of Profit (POP): {pop:.2%}")
# print(f"Implied Volatility: {iv:.4f}")
# print('stock_price:', stock_price)


# def com_days_to_exp(s: str) -> str:
#     # Expiration date in 'YYYY-MM-DD' format
#     expiration_date_str = '2023-07-28'

#     # Convert the expiration date string to a datetime object
#     expiration_date = datetime.strptime(expiration_date_str, '%Y-%m-%d')

#     # Get the current date as a datetime object
#     current_date = datetime.now()

#     # Calculate the difference (timedelta) between expiration date and current date
#     time_difference = expiration_date - current_date

#     # Extract the number of days from the timedelta
#     days_to_expiration = time_difference.days

#     print(f'Days to Expiration: {days_to_expiration} days')
#     return days_to_expiration
