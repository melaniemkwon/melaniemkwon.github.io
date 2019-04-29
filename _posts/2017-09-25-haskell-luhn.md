---
layout: post
title: Luhn Algorithm
tags: [code, haskell]
categories:
- blog
---

## Fun with functional programming: Haskell (Part 2)

Stumbling on, we get to the real 'meaty' part of the Haskell experience - 
higher order functions.

> It turns out that if you want to define computations by defining what stuff IS instead of defining steps that change some state and maybe looping them, higher order functions are indispensable.  
> They're a really powerful way of solving problems and thinking about programs.  
> --[Lipovaca, Learn You A Haskell](http://learnyouahaskell.com/higher-order-functions#composition)

For further practice, we'll implement the [Luhn algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm) in Haskell.

{% highlight haskell %}

{- |
Module      :  Luhn Algorithm (AKA "mod 10")
Author      :  Melanie Kwon

-- Luhn Algorithm (AKA "mod 10") :
   A checksum formula used to validate identification numbers to prevent
   simple typos (i.e. credit card numbers).

Steps:
    1. Starting from the right, 
    move left to double the value of every second digit. 
        Ex:
        [1,  3,  8,  6] becomes..
        [2,  3,  16, 6]

    2. Take the sum of all the digits. 
    (If the doubled result is >9 then add the digits of the product.)
        Ex:
        [2,  3,  16, 6] becomes..
        2 + 3 + 1+6 + 6 = 18.

    3. Divide the sum by 10. If the remainder is 0, then the number is valid. 
    Otherwise, it's not valid.
        Ex:
        18 % 10   ->   8 (not valid)
-}

toDigits :: Int -> [Int]
toDigits n = map (\c -> read [c]) (show n)

doubleEveryOther :: [Int] -> [Int]
doubleEveryOther ds = zipWith (*) (reverse ds) (cycle [1,2])

sumDigits :: [Int] -> Int
sumDigits = sum . concat . map toDigits 

checkSum :: Int -> Int
checkSum = sumDigits . doubleEveryOther . toDigits 

isValid :: Int -> Bool
isValid n = checkSum n `mod` 10 == 0

testCC :: [Bool]
testCC = map isValid [79927398713, 79927398714] -- => [True, False]

{% endhighlight %}

You'll notice that many of these functions are expressed without parameters, or in  
"point-free" style. Does that mean these functions don't expect parameters?  
No. Parameters are still expected but due to [<em>currying</em>](http://learnyouahaskell.com/higher-order-functions#curried-functions) we can get rid of writing the parameter on both sides.  

Thanks to currying, we can use point-free style to write more concise code and 
take simple functions and [use composition to glue them to form more complex functions](http://learnyouahaskell.com/higher-order-functions#composition).

So, for instance let's take look at this `checkSum` function:
{% highlight haskell %}

checkSum :: Int -> Int
checkSum n = sumDigits(doubleEveryOther(toDigits n)) 

{% endhighlight %}

Ugh, so many ugly nested parentheses. Let's see if we can use function composition and point-free style to clean things up.

{% highlight haskell %}

checkSum :: Int -> Int
checkSum = sumDigits . doubleEveryOther . toDigits 

{% endhighlight %}

There much better! Clean and concise.
What we just did is formally called <em>eta reduction</em>, where we remove the last parameter of a function if it appears at the end of both sides of an expression.

To learn more about point-free style and abstraction, here's an excellent presentation by Haskell enthusiast, Amar Shah.
[Point-Free or Die: Tacit Programming in Haskell and Beyond](https://www.youtube.com/watch?v=Cy7jBYr3Zvc).