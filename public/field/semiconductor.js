/*

So I've got some divergence which cannot be explained
So I put a field of a positve charge onto it => divergence gone

This is how they told us to solve poisson interatively.
Charge, and U on boundary is given,
we see divergence at current position and add U to our halo.
This is matrix multiplication .. at least after we repeat it for multiple points.
So for same dielectric distribution around a point -> same column values in inverse matrix
I have not found analytical solutions which will help me with my visualization (hi res in space and time).

For free space the inverse can be derived analytical. It is some log(r) for U, 1/r for len(E).
Then I move metal into this .. keeping a far circle at its analyitical value.


----

I cannot build on top of linear equation solvers because I do not understand.
I mean, a halo

I only do a field up to a certain radius because I have to add them all up.
So it is like a 5px radius.

Do not optimize yet. Just a global meander over all cells. If semiconductor,
apply divergence calculation.


*/
/*

speed of light = 4 cells
    solve maxwell equation
        greens function anyway
        charge+current?

    trouble is: combined equations (light+charge) is nonlinear
    so for example I have trouble to simulate metal using the charge
        I could use dielectic constant.
            that acts as a fast first aid and communicates charge nned

speed of electrons = 1/4 cell
    density*gradient
        zero enforcement


Electron in front of metal could work,
but the charge surge needs to propagate to the halo. So basically I cut the metal at the end of the halo and then let poisson do its thing? I mean this will be calculated beforehand.
Do I need to calculate charge carriers? There will be divergence within the metal, it must sum up to 1 ( surface integral around halo. U in halo  relative to zero outside => E)
=> increase U in metal ( recalc poisson ) until surface integral is correct.

When i brush over the semicondoctor all wrong polarity charge carriers are elimated with correct charge carriers withing halo range

When I say I use dielectric constant and low resistance to mark a metal,
I am already done. It is just: should Greens function anticipate the behaviour of the other electrons?
Metal has both kinds of charge carriers.


Lets say I simulate metal beforehand like I add a single free electron fix in the space,
then iterate multiple timesteps for the metal electrons whithin the viewport / the configuration block.
So when an electron moves: remove field at old position, add at new.
Record metal electron movement and add that to ohmic drift.

Full maxwell equations has "inductivity" and thus slows down the signal and leads to a cut-off-
*/ 
//# sourceMappingURL=semiconductor.js.map