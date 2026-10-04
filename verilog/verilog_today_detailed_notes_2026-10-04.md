# Verilog Learning Notes — Today's Session

## Overview

Today I continued learning Verilog through hands-on coding. The main focus was **sequential logic, counters, and Finite State Machines (FSMs)**.

Topics covered:
1. Up counters
2. Synchronous reset
3. Counter overflow
4. Enable-controlled counters
5. Down counters
6. Up/down counters
7. Mode-controlled counters using `case`
8. Introduction to FSMs
9. Two-state FSM
10. FSM with an input
11. Standard 3-part FSM structure
12. Moore FSM

> **Mealy FSM is intentionally not included in this document.**

---

# 1. Up Counter

A counter is sequential logic that changes its value on a clock edge.

```verilog
module main (
    input clk,
    output reg [7:0] q
);

    always @(posedge clk) begin
        q <= q + 1;
    end

endmodule
```

The counter changes only on the **rising edge** of the clock.

Example:

| Rising edge | q |
|---:|---:|
| 1 | 0 → 1 |
| 2 | 1 → 2 |
| 3 | 2 → 3 |
| 4 | 3 → 4 |

---

# 2. Synchronous Reset

A reset can force a counter/register to a known value.

```verilog
always @(posedge clk) begin
    if (reset)
        q <= 8'b00000000;
    else
        q <= q + 1;
end
```

This is a **synchronous reset** because reset is checked only at the clock edge.

If `reset = 1`, `q` becomes zero at the next rising clock edge.

---

# 3. Counter Overflow

A 4-bit counter represents:

```text
0000 = 0
...
1111 = 15
```

After 15:

```text
1111 + 1 = 0000
```

So:

```text
0 → 1 → 2 → ... → 14 → 15 → 0
```

This happens because only four bits are stored.

---

# 4. Enable-Controlled Counter

An enable input controls whether the counter changes.

```verilog
always @(posedge clk) begin
    if (reset)
        q <= 4'b0000;
    else if (enable)
        q <= q + 1'b1;
    else
        q <= q;
end
```

Behavior:

| reset | enable | Action |
|---:|---:|---|
| 1 | X | Reset to 0 |
| 0 | 1 | Count up |
| 0 | 0 | Hold |

`q <= q;` is explicit hold behavior. In a clocked block it can normally be omitted because a register naturally keeps its value when it is not assigned.

---

# 5. Down Counter

A down counter counts in the opposite direction.

```verilog
always @(posedge clk) begin
    if (reset)
        q <= 4'b1111;
    else if (enable)
        q <= q - 1'b1;
end
```

For a 4-bit counter:

```text
15 → 14 → 13 → ... → 2 → 1 → 0
```

After zero:

```text
0000 - 1 = 1111
```

So it wraps from 0 back to 15.

---

# 6. Up/Down Counter

An up/down counter can count in either direction.

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

Behavior:

| reset | enable | up_down | Action |
|---:|---:|---:|---|
| 1 | X | X | Reset |
| 0 | 0 | X | Hold |
| 0 | 1 | 1 | Count up |
| 0 | 1 | 0 | Count down |

---

# 7. Mode-Controlled Counter Using `case`

A `case` statement can select different counter operations.

```verilog
always @(posedge clk) begin
    case (sel)
        2'b00: q <= q;
        2'b01: q <= q + 1'b1;
        2'b10: q <= q - 1'b1;
        2'b11: q <= 4'b0000;
        default: q <= 4'b0000;
    endcase
end
```

| `sel` | Operation |
|---|---|
| `00` | Hold |
| `01` | Count up |
| `10` | Count down |
| `11` | Reset |

---

# 8. Testbench Timing

A common clock is:

```verilog
always #5 clk = ~clk;
```

If:

```verilog
clk = 0;
```

then:

```text
0 ns  → clk = 0
5 ns  → clk = 1
10 ns → clk = 0
15 ns → clk = 1
20 ns → clk = 0
25 ns → clk = 1
```

Therefore rising edges occur at:

```text
5 ns, 15 ns, 25 ns, 35 ns, ...
```

Sequential logic using `@(posedge clk)` responds at those rising edges.

## Relative delays

Delays are relative:

```verilog
#10;
#25;
```

means the second event occurs at:

```text
10 + 25 = 35 ns
```

not at 25 ns.

---

# 9. Introduction to FSMs

FSM means **Finite State Machine**.

An FSM is a digital circuit that moves between a finite number of states.

Examples:

- Traffic-light controllers
- UART controllers
- Communication controllers
- Vending machines
- CPU control logic
- Protocol controllers

A simple example:

```text
RED → GREEN → YELLOW → RED
```

The circuit remembers its current state and decides what state comes next.

---

# 10. Two-State FSM

The first FSM used two states:

```verilog
localparam STATE_A = 1'b0;
localparam STATE_B = 1'b1;
```

The state toggled on every rising clock edge:

```verilog
always @(posedge clk) begin
    if (state == STATE_A)
        state <= STATE_B;
    else
        state <= STATE_A;
end
```

Sequence:

```text
A → B → A → B → A → B ...
```

## Unknown initial state

If the state is not initialized or reset, simulation may start with:

```text
state = X
```

where `X` means unknown.

A reset gives the FSM a known starting state.

---

# 11. FSM With Input `x`

The next FSM used an input `x`.

Required behavior:

| Current State | x | Next State |
|---|---:|---|
| A | 0 | A |
| A | 1 | B |
| B | 0 | B |
| B | 1 | A |

Meaning:

```text
x = 0 → stay in the current state
x = 1 → switch to the other state
```

A simple implementation was:

```verilog
always @(posedge clk) begin
    if (x == 1'b1) begin
        if (state == STATE_A)
            state <= STATE_B;
        else
            state <= STATE_A;
    end
end
```

Output:

```verilog
always @(*) begin
    if (state == STATE_B)
        out = 1'b1;
    else
        out = 1'b0;
end
```

---

# 12. Moore FSM

The FSM above is a **Moore FSM** because its output depends only on the current state.

```text
state → output
```

For our example:

```text
STATE_A → out = 0
STATE_B → out = 1
```

The input `x` affects the next state, while the output is determined from the current state.

---

# 13. Standard 3-Part FSM Structure

A clean FSM is commonly divided into three parts:

1. **State register**
2. **Next-state logic**
3. **Output logic**

Conceptually:

```text
                 ┌──────────────────┐
        x ──────>│ Next-State Logic │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌─────────────────┐
       clk ─────>│ State Register  │
      reset ────>│                 │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Output Logic   │
                 └────────┬────────┘
                          │
                          ▼
                         out
```

This separation makes FSMs easier to understand, debug, and expand.

---

# 14. Part 1 — State Register

The state register stores the current state.

```verilog
always @(posedge clk) begin
    if (reset)
        state <= STATE_A;
    else
        state <= next_state;
end
```

Important points:

- Uses `posedge clk`
- Uses nonblocking assignment `<=`
- Reset gives the FSM a known starting state
- Otherwise the current state becomes `next_state`

---

# 15. Part 2 — Next-State Logic

Next-state logic determines where the FSM should go.

```verilog
always @(*) begin
    case (state)

        STATE_A: begin
            if (x)
                next_state = STATE_B;
            else
                next_state = STATE_A;
        end

        STATE_B: begin
            if (x)
                next_state = STATE_A;
            else
                next_state = STATE_B;
        end

        default:
            next_state = STATE_A;

    endcase
end
```

This is **combinational logic**, so:

```verilog
always @(*)
```

is used.

Blocking assignment is normally used:

```verilog
=
```

---

# 16. Part 3 — Output Logic

For the Moore FSM:

```verilog
always @(*) begin
    case (state)

        STATE_A:
            out = 1'b0;

        STATE_B:
            out = 1'b1;

        default:
            out = 1'b0;

    endcase
end
```

The output depends only on:

```text
state
```

Therefore this is a Moore FSM.

---

# 17. Complete Moore FSM

The final FSM structure learned was:

```verilog
module main (
    input clk,
    x,
    reset,
    output reg out
);

    localparam STATE_A = 1'b0;
    localparam STATE_B = 1'b1;

    reg state;
    reg next_state;

    // 1. State register
    always @(posedge clk) begin
        if (reset)
            state <= STATE_A;
        else
            state <= next_state;
    end

    // 2. Next-state logic
    always @(*) begin
        case (state)

            STATE_A: begin
                if (x)
                    next_state = STATE_B;
                else
                    next_state = STATE_A;
            end

            STATE_B: begin
                if (x)
                    next_state = STATE_A;
                else
                    next_state = STATE_B;
            end

            default:
                next_state = STATE_A;

        endcase
    end

    // 3. Output logic
    always @(*) begin
        case (state)

            STATE_A:
                out = 1'b0;

            STATE_B:
                out = 1'b1;

            default:
                out = 1'b0;

        endcase
    end

endmodule
```

---

# 18. Moore FSM State Diagram

```text
              x = 1
        ┌────────────────┐
        │                ▼
     ┌───────┐       ┌───────┐
     │   A   │       │   B   │
     │ out=0 │       │ out=1 │
     └───────┘       └───────┘
        ▲                │
        │                │
        └────────────────┘
              x = 1

x = 0:
A stays A
B stays B
```

Therefore:

```text
A + x=0 → A
A + x=1 → B

B + x=0 → B
B + x=1 → A
```

---

# 19. Blocking vs Nonblocking Review

A major Verilog rule learned earlier:

## Blocking assignment

Usually used for combinational logic:

```verilog
always @(*) begin
    out = a;
end
```

It executes immediately in procedural order.

## Nonblocking assignment

Usually used for sequential logic:

```verilog
always @(posedge clk) begin
    q <= d;
end
```

It models register/flip-flop updates.

### General rule

```text
Combinational logic → always @(*) → =
Sequential logic    → always @(posedge clk) → <=
```

---

# 20. `reg` and `wire`

## `reg`

Used for signals assigned inside an `always` block.

Examples:

```verilog
output reg q;
reg state;
reg next_state;
```

## `wire`

Used for connections driven by modules or continuous assignments.

Example in a testbench:

```verilog
wire out;
```

The testbench normally should not directly assign to a DUT output.

---

# 21. Useful Testbench Pattern

Clock:

```verilog
always #5 clk = ~clk;
```

Initialization:

```verilog
initial begin
    clk = 0;
    reset = 1;
    x = 0;
end
```

Monitor:

```verilog
initial begin
    $monitor("time=%0t clk=%b reset=%b x=%b out=%b",
             $time, clk, reset, x, out);
end
```

End simulation:

```verilog
#100 $finish;
```

---

# 22. Key Lessons From Today's FSM Work

### Lesson 1

An FSM remembers information using a **state register**.

### Lesson 2

The next state is calculated from:

```text
current state + inputs
```

### Lesson 3

A Moore FSM output depends only on:

```text
current state
```

### Lesson 4

Sequential logic uses:

```verilog
always @(posedge clk)
```

### Lesson 5

Combinational logic uses:

```verilog
always @(*)
```

### Lesson 6

Use:

```verilog
<=
```

for sequential state/register updates.

Use:

```verilog
=
```

for combinational calculations.

### Lesson 7

Reset gives the FSM a known starting state.

---

# 23. Current Learning Progress

## Basic Verilog

- Modules
- Inputs and outputs
- `wire`
- `reg`
- `assign`
- Bitwise operators
- Vectors
- Binary/decimal/hex literals

## Combinational Logic

- AND
- XOR
- MUX
- `if`
- `case`
- `always @(*)`
- Adders

## Sequential Logic

- D flip-flop
- `posedge`
- Nonblocking assignment
- Registers
- Synchronous reset
- Asynchronous reset

## Counters

- Up counter
- Down counter
- Enable counter
- Up/down counter
- Counter reset
- Counter overflow
- Mode-controlled counter

## FSMs

- FSM concept
- States
- State transitions
- Two-state FSM
- FSM input control
- Moore FSM
- Current-state register
- Next-state logic
- Output logic
- Standard 3-part FSM structure

---

# 24. Important Coding Patterns

## Flip-flop

```verilog
always @(posedge clk) begin
    q <= d;
end
```

## Register with reset

```verilog
always @(posedge clk) begin
    if (reset)
        q <= 4'b0000;
    else
        q <= d;
end
```

## Counter

```verilog
always @(posedge clk) begin
    if (reset)
        q <= 4'b0000;
    else
        q <= q + 1'b1;
end
```

## Enable counter

```verilog
always @(posedge clk) begin
    if (reset)
        q <= 4'b0000;
    else if (enable)
        q <= q + 1'b1;
end
```

## FSM state register

```verilog
always @(posedge clk) begin
    if (reset)
        state <= STATE_A;
    else
        state <= next_state;
end
```

## FSM next-state logic

```verilog
always @(*) begin
    case (state)
        STATE_A: begin
            ...
        end

        STATE_B: begin
            ...
        end

        default:
            next_state = STATE_A;
    endcase
end
```

## Moore output logic

```verilog
always @(*) begin
    case (state)
        STATE_A: out = 1'b0;
        STATE_B: out = 1'b1;
        default: out = 1'b0;
    endcase
end
```

---

# 25. Big Picture

The most important idea from the FSM lesson is:

```text
             Current State
                  │
                  ▼
        ┌───────────────────┐
Input → │  Next-State Logic │
        └─────────┬─────────┘
                  │
                  ▼
              Next State
                  │
             clock edge
                  │
                  ▼
            Current State
                  │
                  ▼
            Output Logic
                  │
                  ▼
                Output
```

A standard FSM can therefore be understood as:

```text
STATE REGISTER
      ↓
CURRENT STATE
      ↓
NEXT-STATE LOGIC
      ↓
NEXT STATE
      ↓
STATE REGISTER
```

For a **Moore FSM**:

```text
CURRENT STATE → OUTPUT
```

---

# End of Today's Notes

The main achievement today was moving from counters to understanding how real **Finite State Machines** are structured, including the standard 3-part FSM design and Moore FSMs.

**Mealy FSM is not covered in this document.**
