# Verilog Learning Conversation

## User Goal

The user is learning Verilog from scratch through hands-on exercises,
writing code and having it reviewed step by step.

------------------------------------------------------------------------

# 1. Learning Path

The initial learning path was:

1.  What Verilog is
2.  Syntax, modules, and ports
3.  Wires and registers
4.  `assign`
5.  Logic gates
6.  `always`
7.  `if` / `case`
8.  Combinational logic
9.  Sequential logic
10. Flip-flops
11. Registers
12. Counters
13. FSMs
14. Testbenches
15. FPGA-oriented projects

------------------------------------------------------------------------

# 2. Half Adder

The user wrote:

``` verilog
module main (
    input a,
    input b,
    output s,
    output c
);
  assign c = a & b;
  assign s = a ^ b;
endmodule
```

This was confirmed as correct.

Concepts discussed:

-   DUT (Device Under Test)
-   Testbench
-   `reg` vs `wire`
-   `$monitor`
-   `` `timescale ``

For a half adder:

-   Sum = `a ^ b`
-   Carry = `a & b`

------------------------------------------------------------------------

# 3. 2:1 Multiplexer

The user wrote:

``` verilog
module main (
    input a,
    input b,
    input sel,
    output reg out
);
  always @(*) begin
    if (~sel) out = a;
    else out = b;
  end
endmodule
```

This was confirmed as correct.

Concepts discussed:

### `always @(*)`

Used for combinational logic. It means the block should execute whenever
any input used inside changes.

### `if / else`

``` verilog
if (~sel)
    out = a;
else
    out = b;
```

### `~` vs `!`

-   `~` = bitwise NOT
-   `!` = logical NOT

A 2:1 MUX chooses between two inputs based on `sel`.

------------------------------------------------------------------------

# 4. 4:1 Multiplexer

The user wrote:

``` verilog
module main (
    input a,
    b,
    c,
    d,
    input [1:0] sel,
    output reg out
);
  always @(*) begin
    case (sel)
      2'b00: out = a;
      2'b01: out = b;
      2'b10: out = c;
      2'b11: out = d;
      default: out = a;
    endcase
  end
endmodule
```

The testbench was also correct.

Concepts discussed:

### `case`

``` verilog
case (sel)
    2'b00: out = a;
    2'b01: out = b;
    2'b10: out = c;
    2'b11: out = d;
endcase
```

### Vectors

``` verilog
input [1:0] sel;
```

is a 2-bit signal.

### Binary literals

``` verilog
2'b00
```

means:

-   `2` = number of bits
-   `b` = binary
-   `00` = value

### `default`

A `default` case provides behavior for values not explicitly listed.

------------------------------------------------------------------------

# 5. 4-bit Adder

The user wrote:

``` verilog
module main (
    input [3:0] a,
    b,
    output [4:0] out
);
  assign out = a + b;
endmodule
```

This was confirmed as correct.

A 4-bit number can represent:

``` text
0000 through 1111
```

The maximum addition is:

``` text
1111
+1111
-----
11110
```

Therefore a 4-bit + 4-bit result may require 5 bits.

Useful number formats discussed:

``` verilog
4'b1010   // binary
4'd10     // decimal
4'hA      // hexadecimal
```

------------------------------------------------------------------------

# 6. First D Flip-Flop Attempt

The user attempted:

``` verilog
module main (
    input d,
    clk,
    output reg q
);
  always @(posedge clk) begin
    if (d) q = d;
  end
endmodule
```

There were also testbench issues:

``` verilog
reg d, clk, q;
```

and:

``` verilog
always clk = ~clk;
```

These were corrected.

The D flip-flop should be:

``` verilog
module main (
    input d,
    input clk,
    output reg q
);

  always @(posedge clk) begin
    q <= d;
  end

endmodule
```

The clock should be generated with a delay:

``` verilog
always #5 clk = ~clk;
```

The testbench output from the DUT should normally be a `wire`:

``` verilog
wire q;
```

------------------------------------------------------------------------

# 7. Understanding the D Flip-Flop

The user predicted this behavior:

    Time   d   clk   q
  ------ --- ----- ---
       0   0     0   X
       5   0     1   0
      10   1     0   0
      15   1     1   1
      20   0     0   1
      25   0     1   0

This prediction was confirmed as correct.

Important concept:

> A D flip-flop changes its output only on the rising edge of the clock.

So changes in `d` while the clock is not rising do not immediately
change `q`.

------------------------------------------------------------------------

# 8. Why `<=` Instead of `=`?

The user asked why flip-flops use:

``` verilog
<=
```

instead of:

``` verilog
=
```

Explanation:

### Blocking assignment

``` verilog
q = d;
```

The assignment happens immediately in procedural execution.

### Non-blocking assignment

``` verilog
q <= d;
```

The update is scheduled to happen after the current procedural
evaluation.

For sequential logic, non-blocking assignment models the behavior of
real flip-flops more naturally.

General guideline:

### Combinational logic

``` verilog
always @(*) begin
    out = a;
end
```

Use blocking assignment (`=`).

### Sequential logic

``` verilog
always @(posedge clk) begin
    q <= d;
end
```

Use non-blocking assignment (`<=`).

------------------------------------------------------------------------

# 9. Two Flip-Flops in Series

Example:

``` verilog
always @(posedge clk) begin
    q1 <= d;
    q2 <= q1;
end
```

With non-blocking assignments, both right-hand sides are evaluated using
the old values.

Therefore `q2` receives the previous value of `q1`.

This models two cascaded flip-flops.

------------------------------------------------------------------------

# 10. Register Swap Example

The user answered a question involving:

``` verilog
always @(posedge clk) begin
    a <= b;
    b <= a;
end
```

Starting with:

``` text
a = 0
b = 1
```

The user predicted:

### First rising edge

``` text
a = 1
b = 0
```

### Second rising edge

``` text
a = 0
b = 1
```

This was confirmed.

The values swap on every clock edge because non-blocking assignments use
the old values on the right-hand side.

------------------------------------------------------------------------

# 11. Registers

A register is a group of flip-flops operating together.

A 4-bit register can be written:

``` verilog
module main (
    input clk,
    input [3:0] d,
    output reg [3:0] q
);

    always @(posedge clk) begin
        q <= d;
    end

endmodule
```

Conceptually:

``` text
        d[3:0]
           |
           v
     +-------------+
clk ->|  4-bit      |
      |  Register   |
     +-------------+
           |
           v
        q[3:0]
```

At every rising edge of `clk`, the register captures `d`.

Example:

  Clock edge   d        q after edge
  ------------ -------- --------------
  1st          `1010`   `1010`
  2nd          `1100`   `1100`
  3rd          `0011`   `0011`

Important clarification:

> In Verilog, `reg` does not automatically mean a physical hardware
> register. It is a procedural variable type. Whether hardware becomes a
> register depends on how it is used.

------------------------------------------------------------------------

# 12. Reset

Reset is used to put sequential logic into a known state.

Without initialization, a register can start as:

``` text
q = XXXX
```

A common reset value is:

``` text
q = 0000
```

------------------------------------------------------------------------

# 13. Synchronous Reset

A 4-bit register with synchronous active-high reset:

``` verilog
module main (
    input clk,
    input reset,
    input [3:0] d,
    output reg [3:0] q
);

    always @(posedge clk) begin
        if (reset)
            q <= 4'b0000;
        else
            q <= d;
    end

endmodule
```

The important point is:

> Reset is checked only at the rising edge of the clock.

Therefore this is called a **synchronous reset**.

Behavior:

``` text
reset = 1  -> q becomes 0000 at the next rising edge
reset = 0  -> q captures d at the next rising edge
```

------------------------------------------------------------------------

# 14. User's 4-bit Register With Synchronous Reset

The user wrote:

``` verilog
module main (
    input [3:0] d,
    input reset,clk,
    output reg [3:0] q
);

  always @(posedge clk) begin
    if (reset == 1) q <= 4'b0000;
    else q <= d;
  end

endmodule
```

This was confirmed as correct.

A shorter equivalent is:

``` verilog
if (reset)
    q <= 4'b0000;
else
    q <= d;
```

The testbench included:

``` verilog
`timescale 1ns / 1ps

module top ();

  reg [3:0] d;
  reg clk, reset;
  wire [3:0] q;

  main m1 (
      .d(d),
      .reset(reset),
      .clk(clk),
      .q(q)
  );

  always #5 clk = ~clk;

  initial begin
    clk   = 0;
    reset = 0;
    #10;
    d = 4'b1111;

    #5 reset = 1;
    #5 reset = 0;

    #10;
    d = 4'b0001;
  end

  initial $monitor("d = %b  , q = %b", d, q);

endmodule
```

One issue identified was that `d` was not initialized at time 0.

A better version starts with:

``` verilog
initial begin
    clk   = 0;
    reset = 0;
    d     = 4'b0000;

    #10;
    d = 4'b1111;

    #5 reset = 1;
    #5 reset = 0;

    #10;
    d = 4'b0001;

    #10;
    $finish;
end
```

------------------------------------------------------------------------

# 15. Predicting the Synchronous Reset Testbench

The clock was:

``` verilog
always #5 clk = ~clk;
```

Therefore rising edges occur at:

``` text
5 ns
15 ns
25 ns
35 ns
...
```

A representative sequence was:

     Time   reset      d Rising edge?        q
  ------- ------- ------ -------------- ------
     0 ns       0   0000 No                  X
     5 ns       0   0000 Yes              0000
    10 ns       0   1111 No               0000
    15 ns       0   1111 Yes              1111
    20 ns       1   1111 No               1111
    25 ns       0   1111 Yes              0000
    30 ns       0   0001 No               0000
    35 ns       0   0001 Yes              0001

The important observation was:

At 20 ns, reset becomes high, but the output does not immediately become
zero.

At 25 ns, the clock rises while reset is active, so the register resets.

------------------------------------------------------------------------

# 16. Asynchronous Reset

The next topic introduced was asynchronous reset.

Synchronous reset:

``` verilog
always @(posedge clk) begin
    if (reset)
        q <= 4'b0000;
    else
        q <= d;
end
```

Asynchronous reset:

``` verilog
always @(posedge clk or posedge reset) begin
    if (reset)
        q <= 4'b0000;
    else
        q <= d;
end
```

The key difference is the sensitivity list:

``` verilog
@(posedge clk or posedge reset)
```

The block executes when either:

-   `clk` rises, or
-   `reset` rises.

Therefore, if reset goes high, the output resets immediately without
waiting for the clock.

------------------------------------------------------------------------

# 17. Asynchronous Reset Example

Complete 4-bit register:

``` verilog
module main (
    input clk,
    input reset,
    input [3:0] d,
    output reg [3:0] q
);

    always @(posedge clk or posedge reset) begin
        if (reset)
            q <= 4'b0000;
        else
            q <= d;
    end

endmodule
```

Behavior:

``` text
reset = 1 -> q = 0000 immediately
reset = 0 -> q captures d on rising clock edge
```

Comparison:

  Type                 `always` block
  -------------------- -----------------------------------
  Normal D flip-flop   `@(posedge clk)`
  Synchronous reset    `@(posedge clk)`
  Asynchronous reset   `@(posedge clk or posedge reset)`

------------------------------------------------------------------------

# 18. Current Exercise

The current exercise is to write an **8-bit register with asynchronous
active-high reset**.

Requirements:

``` text
d     -> 8-bit input
clk   -> clock
reset -> active-high asynchronous reset
q     -> 8-bit output
```

Behavior:

``` text
reset = 1 -> q = 00000000 immediately
reset = 0 -> q captures d on rising clock edge
```

The user was asked to write:

``` verilog
module main (
    ...
);
```

and submit the code for review.

------------------------------------------------------------------------

# Key Verilog Rules Learned So Far

## Continuous assignment

``` verilog
assign out = expression;
```

Good for straightforward combinational logic.

## Combinational procedural logic

``` verilog
always @(*) begin
    ...
end
```

Generally use blocking assignment:

``` verilog
out = value;
```

## Sequential logic

``` verilog
always @(posedge clk) begin
    ...
end
```

Generally use non-blocking assignment:

``` verilog
q <= value;
```

## Clock generation in a testbench

``` verilog
always #5 clk = ~clk;
```

## Testbench signal types

Signals driven into the DUT are typically:

``` verilog
reg
```

Signals driven out by the DUT are typically:

``` verilog
wire
```

## Vector syntax

``` verilog
[3:0]
```

means 4 bits:

``` text
bit 3  bit 2  bit 1  bit 0
```

## Binary literal

``` verilog
4'b1010
```

means a 4-bit binary value.

## Rising edge

``` verilog
posedge clk
```

means the transition:

``` text
0 -> 1
```

## Blocking vs non-blocking

``` verilog
=
```

generally used for combinational procedural logic.

``` verilog
<=
```

generally used for clocked sequential logic.

## Synchronous reset

``` verilog
always @(posedge clk)
```

Reset is checked on the clock edge.

## Asynchronous reset

``` verilog
always @(posedge clk or posedge reset)
```

Reset can act immediately when it rises.

------------------------------------------------------------------------

# Learning Progress

So far the user has covered:

-   Modules
-   Inputs and outputs
-   `wire`
-   `reg`
-   `assign`
-   AND/OR/XOR-style logic
-   Half adder
-   2:1 MUX
-   4:1 MUX
-   `if`
-   `case`
-   Vectors
-   Binary/decimal/hex literals
-   4-bit adder
-   D flip-flop
-   `posedge`
-   Clock generation
-   `$monitor`
-   Blocking assignment
-   Non-blocking assignment
-   Registers
-   Synchronous reset
-   Asynchronous reset

## Next

The next exercise is:

**8-bit register with asynchronous reset.**

After registers and reset, the planned next major topic is:

**Counters**, followed by more advanced sequential logic such as state
machines and practical FPGA-style designs.
