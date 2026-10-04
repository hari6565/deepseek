# Verilog Learning Notes — Today's Session

## Date
**2026-10-02**

## Today's Focus

Today we moved from basic sequential circuits into practical sequential designs and then started **Finite State Machines (FSMs)**.

### Topics covered
1. 4-bit up counter
2. Counter reset
3. Counter overflow / wrap-around
4. Enable-controlled counter
5. 4-bit down counter
6. Up/down counter
7. Mode-controlled counter using `case`
8. Introduction to FSMs
9. Two-state FSM
10. State concepts
11. FSM with an input — next exercise

---

# 1. 4-bit Up Counter

A counter is a sequential circuit whose value changes on clock edges.

A 4-bit up counter counts:

```text
0000
0001
0010
0011
0100
0101
...
1111
0000
...
```

Basic code:

```verilog
module main (
    input clk,
    output reg [3:0] q
);

    always @(posedge clk) begin
        q <= q + 1'b1;
    end

endmodule
```

The counter changes only when a `posedge clk` occurs.

---

# 2. Counter With Synchronous Reset

```verilog
module main (
    input clk,
    input reset,
    output reg [3:0] q
);

    always @(posedge clk) begin
        if (reset)
            q <= 4'b0000;
        else
            q <= q + 1'b1;
    end

endmodule
```

### Behavior

| Reset | Rising clock edge | Action |
|---:|---|---|
| 1 | Yes | `q = 0000` |
| 0 | Yes | `q = q + 1` |

Because reset is checked inside `always @(posedge clk)`, this is a **synchronous reset**.

---

# 3. Counter Overflow

A 4-bit value ranges from:

```text
0000 = 0
```

to:

```text
1111 = 15
```

After:

```text
1111 + 1
```

the 5th bit is discarded, so:

```text
1111 + 1 = 0000
```

Therefore:

```text
13 → 14 → 15 → 0 → 1 → 2
```

This is called **overflow** or **wrap-around**.

---

# 4. Enable-Controlled Counter

We added an `enable` input.

Goal:

```text
reset = 1  → reset
enable = 1 → count
enable = 0 → hold
```

Code:

```verilog
module main (
    input clk,
    input reset,
    input enable,
    output reg [3:0] q
);

    always @(posedge clk) begin
        if (reset)
            q <= 4'b0000;
        else if (enable)
            q <= q + 1'b1;
    end

endmodule
```

### Behavior

| reset | enable | Result |
|---:|---:|---|
| 1 | X | `q = 0000` |
| 0 | 1 | Count up |
| 0 | 0 | Hold |

When `enable = 0`, the register retains its previous value.

---

# 5. Holding a Register

We initially used:

```verilog
else
    q <= q;
```

This works, but it is not necessary in a clocked register.

This is enough:

```verilog
always @(posedge clk) begin
    if (reset)
        q <= 4'b0000;
    else if (enable)
        q <= q + 1'b1;
end
```

If neither condition is true, `q` holds its value.

---

# 6. 4-bit Down Counter

The key operation is:

```verilog
q <= q - 1'b1;
```

Example:

```text
1111
1110
1101
1100
...
0001
0000
1111
```

Code:

```verilog
module main (
    input clk,
    input reset,
    input enable,
    output reg [3:0] q
);

    always @(posedge clk) begin
        if (reset)
            q <= 4'b1111;
        else if (enable)
            q <= q - 1'b1;
    end

endmodule
```

### Behavior

| reset | enable | Result |
|---:|---:|---|
| 1 | X | `q = 1111` |
| 0 | 1 | Count down |
| 0 | 0 | Hold |

For a 4-bit counter:

```text
0000 - 1 = 1111
```

so down counters also wrap around.

---

# 7. Up/Down Counter

We combined up and down counting using:

```verilog
input up_down;
```

Meaning:

```text
up_down = 1 → count up
up_down = 0 → count down
```

The user wrote:

```verilog
module main (
    input clk,
    input reset,
    input enable,
    input up_down,
    output reg [3:0] q
);

    always @(posedge clk) begin
        if (reset)
            q <= 4'b0000;
        else if (enable)
            if (up_down)
                q <= q + 1'b1;
            else
                q <= q - 1'b1;
    end

endmodule
```

This logic is correct.

### Recommended formatting

```verilog
always @(posedge clk) begin
    if (reset) begin
        q <= 4'b0000;
    end
    else if (enable) begin
        if (up_down) begin
            q <= q + 1'b1;
        end
        else begin
            q <= q - 1'b1;
        end
    end
end
```

Using `begin/end` makes nested conditions easier to read.

---

# 8. Up/Down Counter Behavior

| reset | enable | up_down | Action |
|---:|---:|---:|---|
| 1 | X | X | Reset |
| 0 | 0 | X | Hold |
| 0 | 1 | 1 | Count up |
| 0 | 1 | 0 | Count down |

Example:

```text
q = 0101
enable = 1
up_down = 1

0101 → 0110 → 0111 → 1000
```

Then with `up_down = 0`:

```text
1000 → 0111 → 0110 → 0101
```

---

# 9. Testbench Timing

An important lesson today was that delays are relative.

For:

```verilog
#10;
reset = 1;

#25;
reset = 0;
```

the second change occurs 25 ns after the first delay, not at absolute time 25 ns.

So:

```text
time 0
  |
  +-- #10 → time 10
             |
             +-- #25 → time 35
```

Thus two consecutive delays:

```verilog
#10;
#25;
```

represent 35 ns total elapsed simulation time.

---

# 10. Mode-Controlled Counter

We then used `case` to create four counter modes:

```text
00 → Hold
01 → Count up
10 → Count down
11 → Reset
```

The user wrote:

```verilog
module main (
    input clk,
    input [1:0] sel,
    output reg [3:0] q
);

    always @(posedge clk) begin
        case (sel)
            2'b00:   q <= q;
            2'b01:   q <= q + 1'b1;
            2'b10:   q <= q - 1'b1;
            2'b11:   q <= 4'b0000;
            default: q <= 4'b0000;
        endcase
    end

endmodule
```

This was correct.

### Mode table

| `sel` | Operation |
|---|---|
| `2'b00` | Hold |
| `2'b01` | Count up |
| `2'b10` | Count down |
| `2'b11` | Reset to `0000` |

This was an important step toward FSM design.

---

# 11. Introduction to FSMs

FSM means:

> **Finite State Machine**

An FSM is a circuit that moves between a finite number of states.

Examples:

- Traffic-light controller
- UART controller
- CPU control logic
- Communication controller
- Vending machine
- Protocol controller
- FPGA control logic

A traffic-light example:

```text
RED → GREEN → YELLOW → RED
```

Each box represents a state.

---

# 12. Two-State FSM

We first built a very simple FSM:

```text
STATE_A ↔ STATE_B
```

The states were represented using:

```verilog
localparam STATE_A = 1'b0;
localparam STATE_B = 1'b1;
```

`localparam` gives meaningful names to constant values.

---

# 13. User's Two-State FSM

The user wrote:

```verilog
module main (
    input clk,
    output reg out
);

    localparam STATE_A = 1'b0, STATE_B = 1'b1;

    always @(posedge clk) begin
        if (out == STATE_A)
            out <= STATE_B;
        else
            out <= STATE_A;
    end

endmodule
```

This works as a simple two-state machine because `out` is being used as the state register.

The sequence is:

```text
A → B → A → B → A → ...
```

---

# 14. Important FSM Improvement

For a very small example, using `out` as the state works.

For larger FSMs, it is better to separate:

```text
state
```

from:

```text
output
```

For example:

```verilog
reg state;
```

The state register stores the current state.

The output can then be generated from the current state.

This separation becomes very useful as FSMs become more complex.

---

# 15. Typical FSM Structure

A typical FSM can be thought of as:

```text
             ┌─────────────────┐
             │ State Register  │
             └────────┬────────┘
                      │
                      ▼
Input ──────────> Next-State Logic
                      │
                      ▼
                 Next State
```

And output logic:

```text
Current State ───> Output Logic ───> Output
```

Important FSM concepts:

1. Current state
2. Next state
3. Input
4. Output
5. Clock
6. Reset

---

# 16. FSM With an Input — Next Exercise

The next FSM has two states:

```text
STATE_A = 0
STATE_B = 1
```

and one input:

```verilog
input x;
```

Transition rules:

| Current state | `x` | Next state |
|---|---:|---|
| A | 0 | A |
| A | 1 | B |
| B | 0 | B |
| B | 1 | A |

In words:

```text
x = 0 → stay in the current state
x = 1 → switch to the other state
```

So:

```text
A + x=0 → A
A + x=1 → B

B + x=0 → B
B + x=1 → A
```

The next exercise is to implement this FSM.

---

# 17. Important Verilog Rules Reinforced Today

## Clocked sequential logic

```verilog
always @(posedge clk)
```

Updates on the rising edge.

## Non-blocking assignment

```verilog
q <= value;
```

Preferred for sequential logic.

## Counter increment

```verilog
q <= q + 1'b1;
```

## Counter decrement

```verilog
q <= q - 1'b1;
```

## Enable

```verilog
else if (enable)
    q <= q + 1'b1;
```

When enable is false, the register holds its value.

## `case`

```verilog
case (sel)
    2'b00: ...
    2'b01: ...
    2'b10: ...
    2'b11: ...
endcase
```

Useful for multiple modes.

## `localparam`

```verilog
localparam STATE_A = 1'b0;
localparam STATE_B = 1'b1;
```

Useful for naming FSM states.

---

# 18. Testbench Rules Reinforced Today

Clock generation:

```verilog
always #5 clk = ~clk;
```

This creates a 10 ns clock period.

Rising edges occur at:

```text
5 ns
15 ns
25 ns
35 ns
...
```

Inputs driven by a testbench are usually `reg`:

```verilog
reg clk;
reg reset;
reg enable;
```

DUT outputs are usually `wire`:

```verilog
wire [3:0] q;
```

Do not drive a DUT output from the testbench.

For example, this is not appropriate:

```verilog
wire [3:0] q;

initial begin
    q = 4'b0000;
end
```

Use the DUT's reset instead.

---

# 19. Monitoring Signals

A useful `$monitor` is:

```verilog
initial begin
    $monitor(
        "time = %t, clk = %b, reset = %b, enable = %b, q = %b",
        $time, clk, reset, enable, q
    );
end
```

`$monitor` prints whenever one of its monitored values changes.

---

# 20. Current Learning Progress

Your progression is now:

```text
Basic Verilog
      ↓
Modules and Ports
      ↓
assign
      ↓
Logic Gates
      ↓
Half Adder
      ↓
2:1 MUX
      ↓
4:1 MUX
      ↓
4-bit Adder
      ↓
D Flip-Flop
      ↓
posedge
      ↓
Blocking vs Non-blocking
      ↓
Registers
      ↓
Synchronous Reset
      ↓
Asynchronous Reset
      ↓
Up Counter
      ↓
Enable
      ↓
Down Counter
      ↓
Up/Down Counter
      ↓
case-controlled Counter
      ↓
FSM Introduction
      ↓
Two-State FSM
      ↓
FSM With Input  ← NEXT
```

---

# 21. What You Should Be Comfortable With Now

You should now recognize these patterns:

### D flip-flop

```verilog
always @(posedge clk) begin
    q <= d;
end
```

### Register

```verilog
reg [3:0] q;
```

with clocked assignment.

### Synchronous reset

```verilog
always @(posedge clk) begin
    if (reset)
        q <= 4'b0000;
    else
        q <= d;
end
```

### Asynchronous reset

```verilog
always @(posedge clk or posedge reset) begin
    if (reset)
        q <= 4'b0000;
    else
        q <= d;
end
```

### Up counter

```verilog
q <= q + 1'b1;
```

### Down counter

```verilog
q <= q - 1'b1;
```

### Enable-controlled counter

```verilog
if (enable)
    q <= q + 1'b1;
```

### Up/down counter

```verilog
if (up_down)
    q <= q + 1'b1;
else
    q <= q - 1'b1;
```

### FSM state naming

```verilog
localparam STATE_A = 1'b0;
localparam STATE_B = 1'b1;
```

---

# 22. Next Exercise

Write a two-state FSM with:

```verilog
input clk;
input x;
output reg out;
```

Use:

```verilog
localparam STATE_A = 1'b0;
localparam STATE_B = 1'b1;
```

Rules:

```text
A + x=0 → A
A + x=1 → B

B + x=0 → B
B + x=1 → A
```

Try to write the code yourself before looking at a solution.

---

# Final Summary

Today's biggest progression was:

```text
Register
   ↓
Counter
   ↓
Counter + Reset
   ↓
Counter + Enable
   ↓
Up/Down Counter
   ↓
Multiple Counter Modes
   ↓
State Machine
```

The key new idea is that a circuit can remember **which state it is currently in** and use inputs to decide **which state comes next**.

That idea is the foundation of FSMs and many real digital systems.

## Next lesson

**FSM with input → current state / next state → reset → outputs → practical FSM design.**
