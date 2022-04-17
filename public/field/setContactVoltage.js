// This code is for unit tests. Wired contacts are set using object references gatherd from Names ( single capital letter). The solver works locally on the graph of all wires and cells and it uses double buffers (optimize later?)
export function setContactVoltages(field, allElements, values) {
    field.fieldInVarFloats.forEach(r => {
        r.forEach(cell => {
            if (cell.Contact != null) {
                // see import //   assert( allElements[ cell.RunningNumberOfJaggedArray ]===0) // uh 0 I hate this, but this is all that fits into the map : String
                cell.Potential = allElements[cell.RunningNumberOfJaggedArray] = values.pop();
            }
        });
    });
}
