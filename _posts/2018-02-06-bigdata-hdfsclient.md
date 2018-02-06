---
layout: post
title: HDFS Client - Don't Fear the Command Line!
tags: [big-data]
categories:
- blog
---

(continued from [part 1, Distributed File Systems - Scaling](/blog/2018/02/04/bigdata-scalingdistributedfilesystems.html))

(continued from [part 2, Distributed File Systems - Recovery Process](/blog/2018/02/05/bigdata-scalingdistributedfilesystems2.html))

## First things first, setting up HDFS CLI

Client in Hadoop refers to the Interface used to communicate with the Hadoop Filesystem.
The basic filesystem client `hdfs dfs` is used to connect to a Hadoop Filesystem and perform basic file related tasks. It uses the ClientProtocol to communicate with a NameNode daemon, and connects directly to DataNodes to read/write block data.

Before we get into using the HDFS Client, I'm going to assume you're comfortable using the Unix command line interface (or CLI, for short).

To follow along, it'd be a good idea to install a [Hadoop sandbox](https://docs.microsoft.com/en-us/azure/hdinsight/hadoop/apache-hadoop-emulator-get-started) in a virtual machine,
as most of us probably don't have a personal Hadoop cluster to toy around with.

### Stuff we'll cover on HDFS client
- Useful commands to get information from the Namenode and how to change meta information. 

- How to read and write data with the help of HDFS client. 

- How to transfer files between local and distributed storage. 

- How to change replication factor, update permissions to access data, and get a general report
about files and blocks in HDFS.

### Useful Help Commands

If you ever need help with the HDFS client API, use the following commands:

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type1"></span>
    <br>
    $ <span class="type2"></span>
</div>

<br>
`hdfs` means you're working with the hdfs client.

`dfs` means you're working with the distributed file system API.

---

### Using HDFS Client to communicate with the Namenode

Let's do a read-only request to a name node.

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type3"></span>
</div>

{% highlight bash %}
drwxrwxrwx   - mkwon supergroup          0 2017-11-28 21:41 /data/wiki/en_articles_part
-rwxrwxrwx   1 mkwon supergroup     73.3 M 2017-11-28 21:41 /data/wiki/en_articles_part/articles-part
{% endhighlight %}

`-ls` let's you see the directory content or the file information

`-R` gives you recursive output

`-h` shows file sizes in human readable format

Note: these file sizes don't include replicas. To get the file sizes of space used by all replicas, use `-du`.

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type4"></span>
</div>

{% highlight bash %}
73.3 M  /data/wiki
{% endhighlight %}

Now let's modify the structure of our file system by creating a directory called 'deep'.

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type5"></span>
    <br>
    $ <span class="type6"></span>
</div>

{% highlight bash %}
drwxr-xr-x   - mkwon supergroup          0 2018-02-06 03:12 deep/nested
drwxr-xr-x   - mkwon supergroup          0 2018-02-06 03:12 deep/nested/path
{% endhighlight %}

`-p` If you try to create a deep nested folder, then you will get an error back
if parent folder doesn't exist. To create parent folders automatically, use `-p`.

Alright let's remove the 'deep' folder. Remember to use `-r` to delete folders recursively.

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type7"></span>
</div>

{% highlight bash %}
Deleted deep
{% endhighlight %}

In addition to folders, you can create empty files with `touchz` utility.

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type8"></span>
    <br>
    $ <span class="type9"></span>
</div>

{% highlight bash %}
Found 2 items
-rw-r--r--   1 mkwon supergroup        239 2017-11-28 21:41 README.md
-rw-r--r--   1 mkwon supergroup          0 2018-02-06 04:33 file.txt
{% endhighlight %}

There's a difference between using `touch` in the local file system and `touchz` in the distributed file system.
With `touch`, you use it to update file meta information (ie access and modification type).
With `touchz`, you create a file of zero length. That's where the `z` comes from. 

After creating 'file.txt', let's try and move it to another location with a different name.

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type10"></span>
    <br>
    $ <span class="type11"></span>
</div>

{% highlight bash %}
Found 2 items
-rw-r--r--   1 mkwon supergroup        239 2017-11-28 21:41 README.md
-rw-r--r--   1 mkwon supergroup          0 2018-02-06 16:55 another_file.txt
{% endhighlight %}

`mv` can be used the same way as it is used in the local file system to manipulate files and folders.

---

### Using HDFS Client to communicate with Data Nodes

So up until now, we've been communicating with the namenode.  
Let's move on and discover how to communicate with data nodes.

Use `put` to <strong>transfer a file from the local file system into HDFS</strong>.

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type12"></span>
</div>

<img src="/assets/images/bigdata/localtoHDFS.jpg" alt="transfer file from local to HDFS" style="max-width: 100%">

How do we <strong>read the content of a remote file</strong>?

In the local file system, we use `cat`, `head`, and `tail` to bring the content of a file to a screen. 

In HDFS you can use a `cat` to bring the whole file to a screen. 

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type13"></span>
</div>

{% highlight bash %}
test content #1
test content #2
test content #3
test content #4
{% endhighlight %}

To see only the first lines of the file, use piping as there is no `head` utility in HDFS. 

To see the end of the file you can use `tail` utility. Note that the behavior of
a local `tail` utility and the distributed `tail` utility is different. Local file system commands
are focused on text files. In a distributed file system, we work with binary data. So, the HDFS `tail` command brings out onto the
screen the last one kilobyte of a file.

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type14"></span>
</div>

{% highlight bash %}
test content #12
test content #13
test content #14
test content #15
{% endhighlight %}

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type15"></span>
</div>

{% highlight bash %}
test content #1
test content #2
...
test content #15
{% endhighlight %}

As with moving files from the local file system to HDFS, we can also download files from
HDFS to the local file system by using `get`.

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type16"></span>
    <br>
    $ <span class="type17"></span>
    <br>
    $ <span class="type18"></span>
</div>

{% highlight bash %}
-rw-r--r-- 1 mkwon mkwon 246 Apr 5 13:28 hdfs_test_file_copy.txt
-rw-r--r-- 1 mkwon mkwon 246 Apr 5 13:28 hdfs_test_file.txt
{% endhighlight %}

With the `-getmerge` utility, all of this data can be merged into one local file. 

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type19"></span>
    <br>
    $ <span class="type20"></span>
</div>

{% highlight bash %}
-rw-r--r-- 1 mkwon mkwon 492 Apr 5 13:32 hdfs_merged.txt
-rw-r--r-- 1 mkwon mkwon 246 Apr 5 13:28 hdfs_test_file_copy.txt
-rw-r--r-- 1 mkwon mkwon 246 Apr 5 13:28 hdfs_test_file.txt
{% endhighlight %}

---

### Advanced Commands

So that covers the basic name node and data node APIs. The following are some more advanced commands.

`chown`, which stands for 'change ownership' can be used to configure access permissions.

`groups` is useful to get information about your HDFS ID

`setrep` provides API to decrease and increase replication factor

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type21"></span>
</div>

{% highlight bash %}
Replication 1 set: hdfs_test_file.txt
Waiting for hdfs_test_ le.txt ...
WARNING: the waiting time may be long for DECREASING the number of
replications...done
real 0m13.148s
user 0m4.232s
sys 0m0.156s
{% endhighlight %}

`hdfs fsck`, which stands for 'file system checking utility', can be used to request name node to provide you with the information
about file blocks and the allocations

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type22"></span>
</div>

{% highlight bash %}
Connecting to namenode via http://virtual-master.atp- vt.org:50070
FSCK started by mkwon (auth:SIMPLE) from /138.201.91.190 for path /data/wiki/en_articles
at Wed Apr 05 14:01:15 CEST 2017
/data/wiki/en_articles <dir>
/data/wiki/en_articles/articles 12328051927 bytes, 92 block(s): OKsys 0m0.148s
{% endhighlight %}

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type23"></span>
</div>

{% highlight bash %}
Connecting to namenode via http://virtual-master.atp- vt.org:50070
FSCK started by mkwon (auth:SIMPLE) from /138.201.91.190 for path /data/wiki/en_articles
at Wed Apr 05 14:01:48 CEST 2017
/data/wiki/en_articles <dir>
/data/wiki/en_articles/articles 12328051927 bytes, 92 block(s): OK
0. BP-858288134-138.201.91.191-1481279621434:blk_1073808471_67650 len=134217728
Live_repl=3
1. BP-858288134-138.201.91.191-1481279621434:blk_1073808472_67651 len=134217728
Live_repl=3
2. BP-858288134-138.201.91.191-1481279621434:blk_1073808473_67652 len=134217728
Live_repl=3 ...
{% endhighlight %}

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type24"></span>
</div>

{% highlight bash %}
Connecting to namenode via http://virtual-master.atp- vt.org:50070
FSCK started by mkwon (auth:SIMPLE) from /138.201.91.190 for path /data/wiki/en_articles
at Wed Apr 05 14:01:56 CEST 2017
/data/wiki/en_articles <dir>
{% endhighlight %}

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type25"></span>
</div>

{% highlight bash %}
Connecting to namenode via http://virtual-master.atp- vt.org:50070
FSCK started by mkwon (auth:SIMPLE) from /138.201.91.190 at Wed Apr 05 14:17:54 CEST 2017
Block Id: blk_1073808569
Block belongs to: /data/wiki/en_articles/articles
No. of Expected Replica: 3
No. of live Replica: 3
No. of excess Replica: 0
No. of stale Replica: 0
No. of decommission Replica: 0
No. of corrupted Replica: 0
Block replica on datanode/rack:
virtual-node2.atp- vt.org/default is HEALTHY
Block replica on datanode/rack:
virtual-node3.atp- vt.org/default is HEALTHY
Block replica on datanode/rack:
virtual-node1.atp- vt.org/default is HEALTHY
{% endhighlight %}

`find` is used to search by pattern recursively in the folder

<div style='font-family: Monaco,Menlo,Consolas,"Courier New",monospace;'>
    $ <span class="type26"></span>
</div>

{% highlight bash %}
/data/wiki/en_articles_part
/data/wiki/en_articles_part/articles-part
{% endhighlight %}

---

## Summary

Here, we've covered how to <strong>request meta-information</strong> from the name node
and change its structure. We also learned how to <strong> read and write</strong> data to and from data nodes in HDFS.
And we also covered how to <strong>change the replication factor</strong> of files and <strong>get detailed info</strong> about the data in HDFS.

---

<em>Sources:</em>

<em>Dral, Alexey A. 2014. Scaling Distributed File System. Big Data Essentials: HDFS, MapReduce and Spark RDD by Yandex. <https://www.coursera.org/learn/big-data-essentials></em>

<script src="//code.jquery.com/jquery-latest.js"></script>
<script src="/assets/js/typewriter.min.js"></script>
<script>
    $('.type1').typeIt('hdfs dfs -help', 0.4, 'text')
    .hideCursor();

    $('.type2').pauseIt(4.0)
    .typeIt('hdfs dfs -usage <utility_name>', 0.4, 'text')

    $('.type3').pauseIt(7.5)
    .typeIt('hdfs dfs -ls -R -h /data/wiki', 0.4, 'text')

    $('.type4').pauseIt(9)
    .typeIt('hdfs dfs -du -h /data', 0.4, 'text')

    $('.type5').pauseIt(10)
    .typeIt('hdfs dfs -mkdir -p deep/nested/path', 0.4, 'text')

    $('.type6').pauseIt(12)
    .typeIt('hdfs dfs -ls -R deep', 0.4, 'text')

    $('.type7').pauseIt(14)
    .typeIt('hdfs dfs -rm -r deep', 0.4, 'text')

    $('.type8').pauseIt(16)
    .typeIt('hdfs dfs -touchz file.txt', 0.4, 'text')

    $('.type9').pauseIt(17)
    .typeIt('hdfs dfs -ls', 0.4, 'text')

    $('.type10').pauseIt(18)
    .typeIt('hdfs dfs -mv file.txt another_file.txt', 0.4, 'text')

    $('.type11').pauseIt(19)
    .typeIt('hdfs dfs -ls', 0.4, 'text')

    $('.type12').pauseIt(20)
    .typeIt('hdfs dfs -put <source location> <HDFS destination>', 0.4, 'text')
    
    $('.type13').pauseIt(21)
    .typeIt('hdfs dfs -cat hdfs_test_file.txt | head -4', 0.4, 'text')
    $('.type14').pauseIt(21)
    .typeIt('hdfs dfs -cat hdfs_test_file.txt | tail -4', 0.4, 'text')
    $('.type15').pauseIt(21)
    .typeIt('hdfs dfs -tail hdfs_test_file.txt', 0.4, 'text')

    $('.type16').pauseIt(22)
    .typeIt('hdfs dfs -cp hdfs_test_file.txt hdfs_test_file_copy.txt', 0.2, 'text')
    $('.type17').pauseIt(23)
    .typeIt('hdfs dfs -get hdfs_test* .', 0.2, 'text')
    $('.type18').pauseIt(24)
    .typeIt('ls -lth hdfs*', 0.2, 'text')

    $('.type19').pauseIt(25)
    .typeIt('hdfs dfs -getmerge hdfs_test* hdfs_merged.txt', 0.2, 'text')
    $('.type20').pauseIt(26)
    .typeIt('ls -lth hdfs*', 0.2, 'text')

    $('.type21').pauseIt(27)
    .typeIt('time hdfs dfs -setrep -w 1 hdfs_test_file.txt', 0.2, 'text')

    $('.type22').pauseIt(28)
    .typeIt('hdfs fsck /data/wiki/en_articles -files', 0.2, 'text')
    $('.type23').pauseIt(28)
    .typeIt('hdfs fsck /data/wiki/en_articles -files -blocks', 0.2, 'text')
    $('.type24').pauseIt(28)
    .typeIt('hdfs fsck /data/wiki/en_articles -files -blocks -locations', 0.2, 'text')
    $('.type25').pauseIt(28)
    .typeIt('hdfs fsck -blockId blk_1073808569', 0.2, 'text')

    $('.type26').pauseIt(29)
    .typeIt("hdfs dfs -find /data -name ''*part*'' - iname ''*Article*''", 0.2, 'text')

</script>