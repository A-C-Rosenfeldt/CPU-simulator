import { field2Gl, SimpleImage } from './GL.js';

// test Field .

/* for the simulation we need to set up a lot of pysical parameters. I may make sense to find an order and also to align the unit tests to this. 

liquid needs no temperature. Demo with colored probes? I think that one of these can be 1. Typically, you would stirr with the mouse
	has
		viscosity
		density
	OOP
		we don't call the state equation
		how do I force div v = 0 
			equation get simpler, but I cannot model the algebra. I can just as well multiply 0 in the full equation and hide bugs == focus on other bugs
		

I want this pixel look, so just ad hoc. How do I stirr this with the mouse to test the solver?
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