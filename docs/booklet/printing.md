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

1. **Between the two sides, don't reorder the sheets.** Keep the stack
   exactly as it came out.
2. **Turn the whole stack over in one go**, flipping it along one axis
   only. Don't spin it end to end.
3. **After the second side, reverse the order of the sheets** before
   folding, so the sheet with the cover (page 1) is on the outside.

That's what works on Adam's printer (2026-10-01). Other printers can
feed and stack differently, so if yours is new to you, try one sheet
first: the back of the sheet with page 1 and the last page should get
page 2 and the second-to-last page, the right way up. In the finished
stack, that sheet goes on the outside of the fold.

Then fold the stack in the middle, and staple along the fold if you
like.
