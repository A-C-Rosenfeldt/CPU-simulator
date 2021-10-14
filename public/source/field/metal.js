/*
Metal

the sum of all charges on the metal electrode -  Voltaga-Over-Resistor*Conductivity = charge from last time-step
div potential = charge.density
potential and charge.density are both unknown

Green function: Block-Wise calculation. There is a boundary with E=0,
so the potential varies with the electrode potential ... hm wouldn't
that push the whole block up and down?
I could just linerp between electrodes along y.
Then Semiconductor does the rest.

charge density - voltage over resistance * conductivyty (on the grid) = last frame


I know U is equal over metal    |   I do not know the value of U
I know Charge                   |   I do not know its distribution

How would the interface look like?
add charge to it .. ah head spins

So maybe I should simulate the electrons just not with multiplication?
I = E * S(conductivity)
Electrons need to hop faster then one per grid, so a halo?
Interaction with field is to be included :-(
for ev

So I look around for charge and  .. flow of charge across blocks/cell clusters .
With U I can just create a sharp edge and the next block takes the field lines
With charge carriers I (which are not allowed to change in number), I need to push them over the edge
Question is: Do I use only one shared cell? I think I cannot really distribute correctly beyond that.
I mean, there still is the charge flow phase. So charge could build up at the end and the flows over to the next block (using ohm)
In-frame steps would like the charge to pushed over to them, though. So a DMZ to push charge to?
But i cannot sum up the total charge of the metal up to the border... just using U the charge will probably already build up at the border.
The field is more complicated to calculate. So I will alingn U and Q here. So it is either zero overlap, or two cell overlap. That will give some margin for the current flow

To consider for the electrons:
Do I even like that free charge does not influence U on metal?
After all metal has to supply charge.
But at least within the metal, charge redistribution is quite fast.


Metal does not have that much resistance,
basically within the halo all charges will be redistributed to compensate for the field
When I brush over it, this behaves like eliminating all wiggles in the potential

So only charge movement is different from semi.
so if got U from
conductivity hmm need field update. there is no short-cut

dielectric constant: local instant flow. Q stays constant :-)

*/ 
//# sourceMappingURL=metal.js.map