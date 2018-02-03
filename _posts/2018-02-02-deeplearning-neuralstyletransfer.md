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
minimize the cost and create the image we want. So unlike in most algorithms where
we optimize the cost function to get a set of parameter values, in Neural Style Transfer
we optimize a cost function to get pixel values.

The algorithm builds on top of a pre-trained convolutional network. We'll go with the
what the authors of the paper used - [VGG-19](http://www.vlfeat.org/matconvnet/pretrained/), 
trained on the very large ImageNet database. 

In these particular examples, I used [TensorFlow](https://www.tensorflow.org) but there are lots of other 
great deep learning libraries where gradients are automatically and dynamically 
computed for you. Pytorch being another one. Although it helps to have a GPU to 
for training, a CPU and a little bit of patience works as well. :)

So let's see if we can create an artistic rendition of this cat.

Content Image
<img src="/assets/images/neuralstyletransfer/persian_cat.jpg" alt="cat" style="max-width: 90%">

Style Image - *Rain Princess 2 by Leonic Afremov*
<img src="/assets/images/neuralstyletransfer/rain_princess.jpg" alt="rain princess painting" style="max-width: 90%">

Generated Image 
<img src="/assets/images/neuralstyletransfer/persian_cat_nst.png" alt="cat, generated image" style="max-width: 90%">

Style Image - *The Poppy Field by Claude Monet*
<img src="/assets/images/neuralstyletransfer/monet.jpg" alt="monet painting" style="max-width: 90%">

Generated Image 
<img src="/assets/images/neuralstyletransfer/persian_cat_nst2.jpg" alt="cat" style="max-width: 90%">

Style Image - *Starry Night by Vincent Van Gough*
<img src="/assets/images/neuralstyletransfer/starry_night.jpg" alt="monet painting" style="max-width: 90%">

Generated Image 
<img src="/assets/images/neuralstyletransfer/persian_cat_nst3.png" alt="cat" style="max-width: 90%">

Okay, okay maybe it's not what you'd call a masterpiece but it's still pretty cool.
It really depends on what content and style images you mix and match.
Generally, you start to see attractive results after 140 iterations of training.
The generated images in the examples above are after 200 iterations.
You can also get better results if we "merge" style costs in different proportions
from several different conv layers.

Much credit and thanks to Andrew Ng's [Deeplearning.ai](https://www.deeplearning.ai) course. I highly recommend it
if you want to use deep learning for your own experimentss.

