---
layout: post
title: Distributed File Systems - Recovery Process
tags: [big-data]
categories:
- blog
---

(continued from [part 1, Distributed File Systems - Scaling](/blog/2018/02/04/bigdata-scalingdistributedfilesystems.html))

## Block and Replica States

To understand the recovery process of HDFS, let's first introduce two concepts:

1) <strong>Replica:</strong> A physical data storage on a data node. Usually, there are several replicas with the same content on different data nodes.

2) <strong>Block:</strong> This is meta-info storage on a name node that provides information about replicas' locations and their states.
<img src="/assets/images/bigdata/block_replica.jpg" alt="block and replica" style="max-width: 90%">

Both replica and block have their own states. First, let's take a look at the data node *replica states*.

---

### Replica States and Transitions
<img src="/assets/images/bigdata/replica_states.jpg" alt="replica state transition" style="max-width: 100%">

### <span style="color:dodgerblue">Finalized Replica</span>
When a replica is in a finalized state, that means its content is <strong>frozen</strong>. 
'Frozen' means that the meta-info for this block is aligned with its corresponding replicas' states and data.
This means you can safely read data from any data node and get the same exact content, preserving <strong>read consistency</strong>.
Each block of data has a version number called Generation Stamp (GS). Finalized replicas are guaranteed to all have the same GS number.

### <span style="color:green">Replica Being Written to (RBW)</span>
In this state, the last block of a file is opened or reopened for appending.
Bytes that are acknowledged by the downstream data nodes in a pipeline are visible for a reader of this replica.
Additionally, the data-node and name node meta-info may not match during this state.
In the case of failure, the data node will try to preserve as many bytes as possible with the goal of data durability.

### <span style="color:#CCCC00">Replica Waiting to be Recovered (RWR)</span>
In short, this is the state of all RBW replicas after data node failure and recovery.
RWR replicas will not be in any data node pipeline and therefore will not receive any new data packets. 
So they either become outdated and should be discarded, or they will participate in a special recovery process called a lease recovery if the client also dies.

### <span style="color:crimson">Replica Under Recovery (RUR)</span>
If the HDFS client lease expires, the replica transitions to RUR state.
Lease expiration usually happens during the client's site failure. 

### <span style="color:orange">Temporary</span>
As data grows and different nodes are added/removed from the cluster, data can become
unevenly distributed over the cluster nodes.
<img src="/assets/images/bigdata/uneven.jpg" alt="unevenly distributed data" style="max-width: 100%">
A Hadoop administrator can spawn a rebalancing process or a data engineer can increase the replication factor of data for durability.
In these cases, newly generated replicas will be in a state called <strong>temporary</strong>.
It's pretty much the same state as RBW, except the data is not visible to the user unless finalized.
In the case of failure, the whole data chunk is removed without any intermediate recovery state.

Now, let's take a look at the name node *block states* and transitions.

---

### Block States and Transitions
<img src="/assets/images/bigdata/block_state.jpg" alt="unevenly distributed data" style="max-width: 100%">

### <span style="color:#CCCC00">Block Under Construction</span>
As soon as a user opens a file for writing, the name node creates the corresonding block in the under_construction state.
It is always the last block of a file and its length and GS stamp are mutable. 
The name node block keeps track of the data pipeline and keeps a watchful eye over all RBW and RWR replicas.
<img src="/assets/images/bigdata/replica_states_sm1.jpg" alt="replica state transition" style="max-width: 100%">

### <span style="color:orange">Block Under Recovery</span>
Replicas transition from RWR to RUR state when the client dies or when a client's lease expires. Consequently, the corresponding block transitions from under_construction to the under_recovery state. 
<img src="/assets/images/bigdata/replica_states_sm2.jpg" alt="replica state transition" style="max-width: 100%">

### <span style="color:dodgerblue">Committed</span>
The under_construction block transitions to a committed state when a client successfully requests tge name node to close a file or to create a new consecutive block of data. 
'Committed' that there are already some finalized replicas but not all are finalized. For this reason in order to serve a read request, the committed block needs to keep track of RBW replicas, until all the replicas are transitioned to the finalized state and HDFS client will be able to close the file.
<img src="/assets/images/bigdata/replica_states_sm3.jpg" alt="replica state transition" style="max-width: 100%">

### <span style="color:green">Complete</span>
Finally in the complete state, all the replicas are in the finalized state and therefore are identical and have same GS stamps. The file can be closed only when all the blocks of a file are in 'complete' state.

<img src="/assets/images/bigdata/replica_states_sm4.jpg" alt="replica state transition" style="max-width: 100%">

Having covered the states and transtions, let's go into <strong>recovery procedures</strong>.

---

## Recovery Procedures
There are several types of recovery procedures:

- Block Recovery
- Replica Recovery
- Lease Recovery
- Pipeline Recovery

### Block Recovery
During the block recovery process, the namenode has to ensure that all of the corresponding 
replicas of a block will transition to a common state, logically and physically, 
mean that all the corresponding replicas should have the same content.
The NameNode choses a <strong>primary datanode</strong> (<strong>PD</strong>) which should
contain a replica for the target block. PD requests a new GS, info, and location of other replicas from the NameNode.
PD then contacts each relevant datanode to participate in the <strong>replica recovery process</strong>.
<img src="/assets/images/bigdata/block_recovery.jpg" alt="block recovery process" style="max-width: 100%">

### Replica Recovery
Replica recovery process include aborting active clients writing to a replica, aborting the previous replica or
block recovery process, and participating in final replica size agreement process.
During this phase, all the necessary info and data is propagated through the pipeline.
 <img src="/assets/images/bigdata/replica_recovery.jpg" alt="replica recovery process" style="max-width: 100%">

Lastly, PD notifies the NameNode of its success or failure. In case of failure, NameNode can retry block recovery.

### Lease Recovery
The Block Recovery Process can only happen as a part of a Lease Recovery Process
<img src="/assets/images/bigdata/lease_recovery.jpg" alt="lease recovery process" style="max-width: 100%">
The <strong>Lease Manager</strong> manages all the leases at the NameNode where the HDFS clients request a lease every time they want to write to a file.
The Lease Manager maintains soft and hard time limits where if the current lease holder doesn't renew its lease during the soft limit, another client will take over the lease.
If the hard limit is reached, the lease recovery process will begin.

Throughout this process, there are a couple important of guarantees:

1. <strong>Concurrency control</strong> - event if the client is alive it won't be able to write data to a file.

2. <strong>Consistency</strong> - All replicas should draw back to a consistent state to have the same data and GS.

### Pipeline Recovery
When you write to an HDFS file,
HDFS client writes data block by block. Each block is constructed
through a write pipeline and each block breaks down
into pieces called packets. These packets are propagated to
the datanodes through the pipeline. 

<img src="/assets/images/bigdata/pipeline_recovery.jpg" alt="pipeline recovery process" style="max-width: 100%">

There are three stages to the pipeline recovery process:

1. <strong>pipeline setup:</strong> The client sends a setup message
down through the pipeline. Each datanode opens a replica for
writing and sends ack message back upstream the pipeline.

2. <strong>data streaming:</strong> In this part, data
is buffered on the client's site to form a packet,
then propagated through the data pipeline. Next packet can be sent even before
the acknowledgement of the previous packet is received. 

3. <strong>close:</strong> This is used to finalize replicas, and shut down the pipeline

---

## Summary

- We talked about <strong>block and replica states and transitions</strong>.

- We also covered the write <strong>pipeline stages</strong> and the <strong>four different recovery processes</strong>.

Now that the theory stuff is out of the way, it's time to get our hands dirty.
Next post, we'll stretch our fingers and get familiar with writing commands in the HDFS Client.

<!-- (continue to [part 3, Using HDFS Client - Don't Fear the Command Line!](#)) -->

---
<em>Sources:</em>

<em>Dral, Alexey A. 2014. Scaling Distributed File System. Big Data Essentials: HDFS, MapReduce and Spark RDD by Yandex. <https://www.coursera.org/learn/big-data-essentials></em>
