# Printing the booklet

Build it with `node scripts/build-docs-docx.mjs`, then open
`dist/iter8-it-journey.docx` in Word. The template already sets Book
fold, so Word prints two booklet pages per sheet, in booklet order.

## Printers that print both sides

**File → Print → Print on Both Sides: Flip pages on short edge.** Then
fold the stack in the middle.

## Printing both sides by hand

**File → Print → Manually Print on Both Sides.** Word prints the first
side of every sheet, then asks you to reload the paper.

0. **Load exactly as many sheets as the booklet needs**, fanned (riffle
   the edges so they separate). A booklet of N pages uses N/4 sheets,
   rounded up: 28 pages = 7 sheets.
1. **Count the printed sheets before reloading** (7 for 28 pages). One
   short means two went through together, or one slipped off the output
   tray (it happens: check the floor). Find it or start again; printing
   the backs onto a short stack puts every back after that point on the
   wrong sheet.
2. **Between the two sides, don't reorder the sheets.** Keep the stack
   exactly as it came out.
3. **Turn the whole stack over in one go**, flipping it along one axis
   only. Don't spin it end to end.
4. **After the second side, reverse the order of the sheets** before
   folding, so the sheet with the cover (page 1) is on the outside.

**Most reliable: feed one sheet at a time** for the second side (and
the first, if the printer grabs two). It's slower, but nothing can
double-feed or slip out of order. On Adam's printer, that's what finally
gave a perfect booklet (third attempt, 2026-10-01).

That's what works on Adam's printer (2026-10-01). Other printers can
feed and stack differently, so if yours is new to you, try one sheet
first: the back of the sheet with page 1 and the last page should get
page 2 and the second-to-last page, the right way up. In the finished
stack, that sheet goes on the outside of the fold.

Then fold the stack in the middle, and staple along the fold if you
like.
