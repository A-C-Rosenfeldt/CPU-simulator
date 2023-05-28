import { field2Gl, SimpleImage } from './GL.js';

// test Field .

/* for the simulation we need to set up a lot of pysical parameters. I may make sense to find an order and also to align the unit tests to this. 

liquid needs no temperature. Demo with colored probes? I think that one of these can be 1. Typically, you would stirr with the mouse
	viscosity
	density

I want this pixel look, so just ad hoc. How do I stirr this?
	channel width
	electrode width
	gap width

temperature
	state equation: elastic gas --  shooting out of a tube. Pressure makes a fluid drop go boom
	Schottky-contact

This limits current. I could have drop on an electrode without internal field. Then gas. Then fade in internal field ( real: Lower electrode voltage)
	electron charge
*/

/*
I almost feel like finally the paremters would need to be optimized. For what:
geometric size
high on current
low off current
low capacity
fast switching
*/

/*
Gates with multiple electrodes in series
*/