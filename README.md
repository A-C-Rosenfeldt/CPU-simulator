# CPU-simulator

Ben Eater showed that people are interested in the practical inner working of a CPU. Browsers today are so fast with V8, GPU and WebASM.
Military Symbols resemble real transisors. Real transistors in old ICs mix routing and active areas and are hard to decipher. I want to find a combining language.
Visible 6502 is hard to understand because it works purely on netlists and has no animations. Also color codes are a mystery a bit. No story telling.

Try it out on: https://a-c-rosenfeldt.github.io/CPU-simulator/public

Todo:
Look into multibit-lines: https://de.wikipedia.org/wiki/Logisim
Check volatages: http://forum.6502.org/viewtopic.php?f=8&t=1768


npm test works

VSC mocha test browser again not
    need to delete js files before launch
        I think I already told it to prefer ts of js in    task.json ( but not in launch.json?? )

settings.json
   "mochaExplorer.env": {
        "TS_NODE_PREFER_TS_EXTS":"true",
    repeat this in launch.json

Breakpoints are only recognized within texted files not in the testing file