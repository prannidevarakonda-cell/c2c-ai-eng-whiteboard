# c2c-ai-eng-whiteboard
End of class Project for creative freedom and programming
Python has the backend of the code; HTML for indexing on the interface; CSS for styling; JavaScript for drawing itself.

backend.py — Runs the server and handles backend logic, such as saving or loading drawings and providing API endpoints.
drawing.js — Implements the whiteboard’s interactive drawing behavior, such as mouse/touch input, colors, and clearing the canvas.
index.html — Defines the page structure, including the drawing canvas and any toolbar controls
style.css - Controls the pages appearance, including color  and styling

Use Save to download the current canvas as `whiteboard.png`. Use Load Drawing
to select a previously downloaded PNG and restore it to the canvas. To also
save a server copy in the project folder, start the backend with
`python backend.py` and open http://127.0.0.1:8000; the server copy is saved as
`saved_drawing.png`.


Drawing System; pointerdown method starts when the code reads the pointers position, reads the slider's current value, and tells the canvas to start a new path on the next coordinate. every time you draw the stroke, the code adds each new position to the path. pointerup method ends the stroke.


Possible problem: When I tried adding new butonns/features to my code, the layout was messed up and uneven, which was not in the layout of 2x4 I planned. One quick fix was simply making the 8 buttons in a neat 2x4 grid and the same siZe.

The ruler button shows a movable, rotatable guide. When it is active, drawing strokes snap to the guide's edge for straight lines.


The drawing system is handled in drawing.js using the HTML canvas. When you press or touch the canvas, it records the starting point and marker size; as you move, it draws a line between successive points, scaling pointer coordinates to match the canvas. The selected color controls the stroke, while the eraser uses canvas compositing to remove marks. With the ruler toggle on, moving shows a straight-line preview, and releasing draws that line on the canvas. The Clear button empties the drawing; the canvas image is also what Save downloads.
