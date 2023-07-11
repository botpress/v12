---
id: flow-memory
title: Flow Memory
---

--------------------

In a conversation, you may want to ask questions to the user and remember their answers for later use. You may also want to access the values that your chatbot extracts.

## System Parameters

When a user talks to a chatbot, Botpress tracks all variables and parameters associated with that chatbot as the chatbot transitions from one state to another. If you run the debugger, you will see the tree of all system parameters that it tracks. To open the tree in the bottom panel (default), click the debugger icon in the top right corner.

![How to Access Debugger](/assets/access-debugger.png)

You can access these system parameters from the Flow Editor and within your code (including in actions). To reference a parameter, prefix the path shown in the emulator with `event.`.

For example, when the path shown in the debugger to the language parameter is `nlu.language`, you can reference that parameter as `event.nlu.language`.

![NLU Language Emulator](/assets/nlu-emulator.png)

In the Flow Editor, you can access system parameters by bracketing them with two sets of curly brackets.

You can also set variables to be the value of a system parameter, such as the user input language `{{event.nlu.language}}`, as follows:

![NLU Language Set Variable](/assets/nlu-variable.png)

For raw expressions or code (such as in actions), you don't need the curly brackets. Here is an example of a raw expression in a transition:

![NLU Language Raw Expression](/assets/nlu-raw-expression.png)

As above, you can access the values of extracted slots by copying the path from the emulator and prefixing it with `event.` (e.g., `{{state.session.slots.food.value}}`) in the flow builder and `state.session.slots.food.value` in code. `food` is a slot that was set up intentionally by the chatbot builder.

![Slot Extraction Emulator](/assets/slot-extraction-emulator.png)

As in JavaScript, you can access parameters using the square bracket notation:

`{{state.session.slots["food"].value}}`

## Memory Variables

There are four different kinds of memories in Botpress; the difference between them is the duration and the scope.

- `user` memory is kept forever for the user it is associated with.
- `session` memory is kept for the duration of the configured session.
- `temp` memory is only kept for the duration of the flow.
- `bot` memory is the same value for all users of the same chatbot.

Most of the time, you will rely on the `user` and `temp` type of memory.

## Setting and Accessing Variables

Use the **Set Variable** action (see the [Dialog Memory](#dialog-memory) section below) or code to set up or declare variables. When using the **Set Variable** action dialog, the variable is set up and assigned a value.

:::note
In code, the variable is declared when you use it.
:::

As with system parameters (see [System Parameters](#system-parameter) section), variables can be accessed in the flow builder and the **Set Variable** dialog by bracketing the variables with double curly brackets (such as `{{temp.user_name}}`). 

:::note
In code or raw expressions, the reference to the variable doesn't need the double curly brackets.
:::

For example, your chatbot would reference the variable as:

`temp.user_name`

### Bot Memory

The `bot` memory is the same value for all users of the chatbot. Think of it as a global variable but scoped to this chatbot only.

## How to Change What's in the Memory?

Use the action `base.setVariable` and specify the type of memory, the variable's name, and what value your chatbot should set it to.

Actions in your code file allow you to update these variables directly. For example, `user.firstname = 'potato'` updates the user's first name.
