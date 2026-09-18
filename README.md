# easySinth
This is an **online** ([`tone.js`](https://tonejs.github.io/)) based synthetizer. It will have: Effects, all kind of oscillators, filters, MIDI support, and much more...
---
If you want to use your MIDI controller with this synth, you must enable our webpage to acces your MIDI inputs (you have to do this only once):
Usually the your browser gives you a pop-up about this, that yous hould accept, but in some cases you wont have this (eg.: on Windows x Firefox).
## In firefox it's easy:
1. Click the shield icon in the search bar. ![It's at the left side of your search bar.](media/f-search_bar.png)
2. Select the "Connection secure" button with a lock icon.
3. Open: "More site information". ![Here you should see what you are expected to open.](media/f-security.png)
4. Go to the Permissions tab.
5. Scroll down until you find MIDI devices settings. ![The checkboxes before.](media/f-MIDI_devices_def.png)
6. Unselect the use default checkbox, and click allow, on both of the permissions. ![The checkboxes after.](media/f-MIDI_devices_allow.png)
7. Now you can close this window (or pop-up), and enjoy your MIDI device!

## In chromium based browsers: In chromium based browsers (e.g.: Chrome, Edge, Opera, Brave) yous should have a pop up window, that you should allow. In the case that this did not happem:

1. You will have a settings icon in your search bar. ![t's at the left side of your search bar.](media/chrome-site-settings.png)
2. Click that icon, and go to site settings. ![Here you should see the default MIDI settings...](media/chrome-MIDI_def.png)
3. Select MIDI devices and reprogram, and select allow. ![Here you should see the allowed MIDI settings...](media/chrome-MIDI-allowed.png)
<br>
The ui can vary, and the title of the buttons too, but the main process should be the same in most browsers.