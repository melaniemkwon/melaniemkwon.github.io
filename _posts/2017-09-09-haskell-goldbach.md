---
layout: post
title: Goldbach's Other Conjecture
tags: [code, haskell]
categories:
- blog
---

## Fun with functional programming: Haskell

Learning Haskell is turning out to be a confusing but enlightening
journey for me. Though there's quite a few tutorials on Haskell, but the one I'd
recommend is [Learn You A Haskell](http://learnyouahaskell.com/) by Miran Lipovaca. 
It's free to read online and an excellent resource for coders with experience
in imperative programming languages (C, C++, Java, Python...)

For practice, below is an implementation of
[Goldbach's Other Conjecture](https://projecteuler.net/problem=46).

{% highlight haskell %}
{- |
Module      :  disprove goldbachs other conjecture
Author      :  Melanie Kwon

-- Goldbach's other conjecture (disproved) :
   Every odd composite number can be expressed as 
   the sum of a prime and twice a square.

The program finds the first two non-prime odd numbers so that for each there is 
no prime p and integer k > 0 such that the number is equal to p + 2 * k^2.
-}

-- infinite list of odd numbers
oddsFrom3 :: [Integer]
oddsFrom3 = [3, 5 .. ]

-- Arguments: integer n
-- Return: integer -- square root of 'n' floored
primeDivisors :: Integer -> [Integer]
primeDivisors n = [d | d <- takeWhile(\x -> x^2 <= n) primes, n `mod` d == 0]

-- infinite list of prime integers
primes :: [Integer]
primes = 2 : [n | n <- oddsFrom3, null (primeDivisors n)]

-- Arguments: integer n
-- Return: integer -- square root of 'n' floored
iSqrt :: (Integral a, Integral b) => a -> b
iSqrt n = floor (sqrt (fromIntegral n))

-- Arguments: integer n
-- Return: boolean -- True if 'n' a perfect square, otherwise False
isASquare :: Integral a => a -> Bool
isASquare n = (iSqrt n) ^ 2 == n 

-- Arguments: integer n
-- Return: boolean -- True if 'n' is prime, otherwise False
isPrime :: Integer -> Bool
isPrime n = n `elem` ( takeWhile(<=n) primes )

-- Arguments: odd non-prime integer g
-- Return:
-- List of integer pairs 'p' and 'k' that meet the conjecture, where
-- 'g' is the sum of a prime 'p' and twice a square k
--      p + 2 * k * k, where k > 0
goldbachPK :: Integral t => Integer -> [(Integer, t)]
goldbachPK g = [(p, iSqrt kk) | p <- takeWhile(<g) primes,
                                let kk = (g - p) `div` 2, isASquare kk]

-- Infinite list of odd composite numbers
oddComposites :: [Integer]
oddComposites = [n | n <- oddsFrom3, not (isPrime n)]

-- Disprove conjecture by getting list of numbers that lack (p,k) pairs
goldbachDisprove :: [Integer]
goldbachDisprove = [g | g <- oddComposites, null (goldbachPK g)]

{% endhighlight %}
