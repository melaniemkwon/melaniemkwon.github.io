---
layout: post
comments: true
title: DIY Jupyter Notebook Server
tags: [tutorials, networking]
categories:
- blog
---

## [Tutorial] Set up an SSH Server on a Home Computer

Wanting to avoid the hassle of paying for cloud computing services (\*cough\* AWS) for Kaggle competitions and machine learning projects,
I decided to repurpose my old gaming computer to a deep learning rig. After driving down to Microcenter to
grab the last Nvidia GTX 1060 6GB card, I spent the weekend installing the video card, downloading all the drivers/libraries, 
and even troubleshooting an unexpected hard disk failure. 
(Btw, for an in-depth tutorial on setting up your own deep learning box, refer to Appendix A of Francois Chollet's book [Deep Learning with Python](https://www.manning.com/books/deep-learning-with-python)).

After I was finally successful, I wanted to take it to the next step --
access my desktop machine remotely. The goal was to have the power of my new GPU-souped rig accessible from my macbook.
Enter **SSH tunneling**~~~
<div>
    <i class="fa fa-5x fa-laptop">&nbsp;</i>
    <i class="fa fa-5x fa-angle-double-right">&nbsp;</i>
    <i class="fa fa-5x fa-server">&nbsp;</i>
</div>

### What is SSH?
**SSH** stands for "secure socket shell". SSH allows us to establish a secure connection between two computers. 
An **SSH server** is a process running on your computer that waits for outside computers to request access via a specific port, authenticates that user, and then allows access to the computer.

Moving forward, 'host' will indicate the computer running the SSH server, while 'client' will refer to any computer requesting access to the host.
In this guide, I'll teach you how to issue commands from a client machine that are executed by the host machine.

### What you'll need
Before following along, you'll need:

* A unix-based computer that will host the SSH server (my desktop machine uses Ubuntu 16.04 LTS)
* A different computer to test the remote connection to the server (my macbook, in this case)
* Access to a network different from the one to which your host machine is connected (optional)
* Access to your router's web interface admin page.

---


<h3><i class="fa fa-2x fa-wrench">&nbsp;</i>Setup</h3>

On your host computer, start by updating your system packages:
{% highlight bash %}
$ sudo apt-get upgrade
{% endhighlight %}
Install **openssh-server** and **openssh-client**. This allows us to run an SSH server on our machine that will handle requests for access to the host computer from other devices.
Also, make sure to install **openssh-client** on machines that will be used as clients.
{% highlight bash %}
$ sudo apt-get install openssh-client
$ sudo apt-get install openssh-server
{% endhighlight %}
Check that the SSH server process is now running on your host machine. 
{% highlight bash %}
$ ps -A | grep sshd
{% endhighlight %}
The `ps` command outputs a list of currently running processes
which can be piped to `grep` to search for the name `sshd`.

You should see something like this:
{% highlight bash %}
[number] ?  00:00:00 sshd
{% endhighlight %}

Alright, let's try "logging in" to the host machine from the host machine.
{% highlight bash %}
$ ssh localhost
{% endhighlight %}
Try moving around in the shell (ls, cd, pwd, etc.) and make sure everything's working. Type `exit` to end the session.

---

<h3><i class="fa fa-2x fa-angle-double-right">&nbsp;</i>Connect from the 'client' machine INSIDE the network</h3>

First, make sure that your client machine is on the same network as the server.
If your client and host are on the same wifi network, you're good to go.

Get the **private** IP address of your host machine:
{% highlight bash %}
$ ifconfig
{% endhighlight %}

Now, log in from the client machine using that IP address:
{% highlight bash %}
$ ssh username@X.X.X.X
{% endhighlight %}

You'll be prompted for the password of the account you used in your `ssh` command.
After successfully logging in, you'll see a "Welcome to Ubuntu X.X.X" message.
Congratulations! You've just established a secure shell connection.

Again, move around in the shell (ls, cd, pwd, etc.) and make sure everything's working. Type `exit` to end the session.

---

<h3><i class="fa fa-2x fa-angle-double-right">&nbsp;</i>Connect from the 'client' machine OUTSIDE the network</h3>

But what if you want to access the host machine from outside the same network?

On your host machine, get your **public** IP address by going to [www.whatsmyip.org](http://www.whatsmyip.org).
It should be in the form of XX.XX.XXX.XXX.

{% highlight bash %}
$ ssh username@[public IP address]
{% endhighlight %}

If you try to `ssh` from your local coffee shop's wifi with the host's public ip, 
the command will hang and then eventually time out. This is because
when a client machine sends a request to connect to the public IP address, 
your router does not know which of the devices on your private network the request is meant for. 

I'm not going to go into detail about Network Address Translation, but you can
read more about it [here](https://computer.howstuffworks.com/nat.htm).

So what's the solution?
We have to set up 'port fowarding' on our router. 

---

<h3><i class="fa fa-2x fa-unlock">&nbsp;</i>Set up Port Forwarding on your router</h3>

**Port forwarding** means telling your router to forward requests made using a 
specific port to a particular device on your private network.

The process is slightly different depending on the router, but these are the general steps:

1. Log in to your router's admin page (open your browser to either 192.168.0.1 or 192.168.1.1).

2. Navigate to the page for adding a service (SSH is usually a default option).

3. Enter the port number where requests will be made (22 by default for SSH).

4. Enter the private IP address of your host machine. 
- *(NOTE: if you want to prevent your local IP address from constantly changing,
you need to specify a reserved IP address for the host in the LAN. That way the PC will always receive the same IP address each time when it connects the DHCP server.
To do so, use your Google-fu skills to look up **DHCP reservation** or **address reservation** instructions for your particular router.)*

5. Save your settings.

Now let's try..
{% highlight bash %}
$ ssh username@[public IP address]
{% endhighlight %}
You'll be prompted for your host machine password and then admitted access.
Sweet! Now we can `ssh` from outside the host machine's network.

<i class="fa fa-2x fa-exclamation-circle">&nbsp;</i>
But wait, we're not done yet! If we leave our `ssh` settings as is, this leaves us
vulnerable to attacks. After only two days of leaving my host machine on with these settings, 
I had pages and pages of logs showing failed brute-force login attempts from Chinese and Russian IP addresses.

To see a log of failed login attempts, use:

`$ grep sshd.\*Failed /var/log/auth.log | less`

Passwords are notoriously easy to crack, so
it's much more secure to use **public key authentication**.

Key-based authentication uses two keys, one "public" key that anyone is allowed to see, and another "private" key that only the owner is allowed to see. To securely communicate using key-based authentication, one needs to **create a key pair**, securely store the private key on the computer one wants to log in from, and store the public key on the computer one wants to log in to.

<i class="fa fa-2x fa-lock">&nbsp;</i>
To create a public/private key pair, follow Ubuntu's instructions here:
[SSH/OpenSSH/Keys](https://help.ubuntu.com/community/SSH/OpenSSH/Keys#keys-with-specific-commands).

---

<h3><i class="fa fa-2x fa-lock">&nbsp;</i>Enable public key authentication on the SSH server</h3>

Are your keys ready? Good, now let's enable public key authentication on the SSH server.

We'll be making changes to the configuration settings for our SSH server. On Ubuntu, these settings are located in the `/etc/ssh/sshd_config` file.
To edit this file, you will need to open it as a super user.

In the config file, change `PasswordAuthentication` to no.
{% highlight bash %}
PasswordAuthentication no
{% endhighlight %}

This will prevent users from being able to access the server with only a password, protecting us against brute force attacks.

We can also change the port SSH uses (instead of the default 22):
{% highlight bash %}
Port [new port number]
{% endhighlight %}

- *NOTE: Your router will still attempt to send SSH requests to port 22, so remember to go back into your router's settings and update the port number for the SSH service.*

Let's also limit which users are allowed to SSH in. At the bottom of the config file add:
{% highlight bash %}
AllowUsers [user1] [user2] ...
{% endhighlight %}

Next, we'll disable root login via SSH.
{% highlight bash %}
PermitRootLogin no
{% endhighlight %}

We can also lower brute force attacks by limiting the number of concurrent connections to the SSH server.

Change
{% highlight bash %}
#MaxStartups 10:30:60
{% endhighlight %}

to
{% highlight bash %}
MaxStartups 3
{% endhighlight %}

#### Restart SSH server
After you're finished with all your config updates. Make sure to restart ssh server.
{% highlight bash %}
$ sudo systemctl restart ssh
{% endhighlight %}

---

<h3><i class="fa fa-2x fa-check">&nbsp;</i>Finally, let's SSH securely</h3>
So you've generated your key pair on your client machine, transferred the client public key to the host's `authorized_key` file,
and updated the `ssh_config` file. Also, if you've changed your port setting from something other 
than 22, make sure that's reflected in your router port forward settings.

Now let's log in. (The `-p` specifies the port number.)
{% highlight bash %}
$ ssh -p 'XX' 'user@XX.XX.XXX.XXX'
{% endhighlight %}

When you generated your keys, if you created a passphrase enter it in.
And voila!

{% highlight bash %}
Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.13.0-32-generic x86_64)
{% endhighlight %}

We're in.

---

<h3><i class="fa fa-2x fa-book">&nbsp;</i>Connect to server's Jupyter Notebook via SSH tunneling</h3>

Now say you've got Jupyter Notebook and all your favorite data science libraries
on your server. How can we connect to the Jupyter Notebook web interface running on our server?

#### Set up a password for Jupyter Notebook
Starting at notebook version 5.0, you can enter and store a password for your notebook server with a single command. `jupyter notebook password` will prompt you for your password and record the hashed password in your `jupyter_notebook_config.json`.
{% highlight bash %}
$ jupyter notebook password
Enter password:  ****
Verify password: ****
[NotebookPasswordApp] Wrote hashed password to /Users/you/.jupyter/jupyter_notebook_config.json
{% endhighlight %}

#### SSH Tunneling with a Mac or Linux
We update the ssh login like so:
{% highlight bash %}
ssh -p 'XX' -L '8000:localhost:8888' 'user@XX.XX.XXX.XXX'
{% endhighlight %}

`-L` specifies that the given port on the client is to be forwarded to the host and port on the remote side. 
This means that whatever is running on the second port number (i.e. 8888) will appear on the first port number (i.e. 8000) on your local computer.

#### SSH Tunneling with Windows and Putty
If you're in a Windows machine, see this guide for Putty instructions: [https://www.digitalocean.com/community/tutorials/how-to-set-up-a-jupyter-notebook-to-run-ipython-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-jupyter-notebook-to-run-ipython-on-ubuntu-16-04)

So now, on your client computer if you open your browser to `http://localhost:8000`,
you should see the host computer's Jupyter notebook web interface.

<img src="/assets/images/jupyterlogin.jpg" alt="jupyter notebook login" style="max-width: 90%">

You'll see a login screen. Enter the notebook password that you had defined earlier.

<img src="/assets/images/jupyternotebook.jpg" alt="jupyter notebook from server" style="max-width: 90%">

Presto! Now can run your server's Jupyter Notebook from your laptop computer.

---

<h3><i class="fa fa-2x fa-cloud">&nbsp;</i>Some closing thoughts</h3>
All in all, it's way easier to use cloud. But if you want a dedicated machine for personal
projects without the hassle of hourly $0.90 charges looming over your head, it pays
to put in the sweat to set up your own server.

---

Sources:

[https://dev.to/zduey/how-to-set-up-an-ssh-server-on-a-home-computer](https://dev.to/zduey/how-to-set-up-an-ssh-server-on-a-home-computer)

[https://help.ubuntu.com/community/SSH/OpenSSH/Keys#keys-with-specific-commands](https://help.ubuntu.com/community/SSH/OpenSSH/Keys#keys-with-specific-commands)

[http://jupyter-notebook.readthedocs.io/en/stable/public_server.html#automatic-password-setup](http://jupyter-notebook.readthedocs.io/en/stable/public_server.html#automatic-password-setup)

[https://www.digitalocean.com/community/tutorials/how-to-set-up-a-jupyter-notebook-to-run-ipython-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-jupyter-notebook-to-run-ipython-on-ubuntu-16-04)