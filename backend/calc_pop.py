import numpy as np
import math
import scipy
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


# Example usage:
stock_price = 100  # Current stock price
strike_price = 105  # Option's strike price
days_to_expiration = 30  # Days to option expiration
implied_volatility = 0.2  # Implied volatility as a decimal (20%)
option_type = 'call'  # 'call' or 'put'

pop = calculate_pop(stock_price, strike_price,
                    days_to_expiration, implied_volatility, option_type)
print(f"Probability of Profit (POP): {pop:.2%}")


def calculate_option_price(stock_price, strike_price, days_to_expiration, implied_volatility, option_type, market_price):
    # Implement your option pricing model (e.g., Black-Scholes) here
    # Calculate and return the option price

    # Constants
    S = stock_price
    K = strike_price
    T = days_to_expiration / 365.0  # Convert days to years
    r = 0.05  # Risk-free interest rate (adjust as needed)

    # Calculate d1 and d2
    d1 = (math.log(S / K) + (r + (implied_volatility**2) / 2) * T) / \
        (implied_volatility * math.sqrt(T))
    d2 = d1 - implied_volatility * math.sqrt(T)

    if option_type == 'call':
        # Calculate call option price
        option_price = S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
    elif option_type == 'put':
        # Calculate put option price
        option_price = K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
    else:
        raise ValueError("Option type must be 'call' or 'put'")

    return option_price


def implied_volatility(option_type, stock_price, strike_price, days_to_expiration, market_price):
    def f(volatility):
        option_price = calculate_option_price(
            stock_price, strike_price, days_to_expiration, volatility, option_type, market_price)
        return option_price - market_price

    # Brent's method to find the implied volatility
    implied_volatility = brentq(f, 0.001, 10.0)  # Adjust the range as needed

    return implied_volatility


# Example usage:
option_type = 'call'  # 'call' or 'put'
stock_price = 100
strike_price = 105
days_to_expiration = 30
market_price = 5.0  # The market price of the option

iv = implied_volatility(option_type, stock_price,
                        strike_price, days_to_expiration, market_price)
print(f"Implied Volatility: {iv:.4f}")
