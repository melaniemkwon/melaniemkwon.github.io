---
layout: post
title: Can a machine create art?
tags: [machine-learning]
categories:
- blog
---

## Deep Learning: Creating Art with Neural Style Transfer

Besides classification and object detection, convolutional neural networks can be 
used to artificially generate suprisingly beautiful works of art. 
One such way is called the neural style transfer, a technique developed by 
Leon A. Gatys, Alexander S. Ecker and Matthias Bethge. 

You can read their paper [here](https://arxiv.org/abs/1508.06576), 
but the gist of it is this -- Neural Style is an algorithm that takes a 'content' 
image (kitty cat), a 'style' image (painting) and outputs a generated image 
where the 'content' image takes on the artistic characteristics of the 'style' image.
Defining a cost function for the generated image, we use gradient descent to 
minimize the cost and create the image we want.

In these particular examples, I used TensorFlow but there are lots of other 
great deep learning libraries to choose from. Pytorch being another one.
Although it helps to have a GPU to for training, a CPU and a little bit of 
patience is really all you need. :)

Content Image
![alt text](/assets/images/neuralstyletransfer/persian_cat.jpg)

Style Image
![alt text](/assets/images/neuralstyletransfer/rain_princess.jpg)

Generated Image (after 200 iterations)
![alt text](/assets/images/neuralstyletransfer/persian_cat_nst.png)

Style Image
![alt text](/assets/images/neuralstyletransfer/monet.jpg)

Generated Image (after 120 iterations)
![alt text](/assets/images/neuralstyletransfer/persian_cat_nst2.png)

Okay okay maybe it's not what you'd call a masterpiece but it's still pretty cool.
It really depends on what content and style images you mix and match.
Generally, you start to see attractive results after 140 iterations of training.

Much credit and thanks to Andrew Ng's Deeplearning.ai course. I highly recommend it
if you want to get down in the details of the mathematics and code.

