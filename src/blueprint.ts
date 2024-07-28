import { Blueprint } from "./blueprintstore"

let x: Blueprint = {
  selector: "prompts make model",
  mutators: [
    {
      kind: "create",
      // generated from template
      action: `
        doc.createTable()
        doc.createPicture();
        ...
      `
    },
    {
      kind: "change_color",
      action: `
        doc.select("paragraph").forEach(x => x.color = x)
      `
    },
    {
      kind: "layout",
      onChange: `
        let paraMeasure = doc.select().measure()
        if(paraMeasure.lines > 1) {
          para.font.size -= 1;
        }
      `
    }
  ]
}
