# Sacred Text Markup Language
This document proposes a xml based file format, called _sacred text markup language_ or _stml_ for short, that can be used to represent books containing holy scripture. The specification will continually be improved. The current version of the specification is 0.1.

## Structure
Each document consists of a single top-level element `book`.

### book
The `book` element has a single attribute `id` that contains a globally unique id which is typically derived from the english title of the book.

Each `book` element contains one `meta` and one `content` element.

### meta
The `meta` element contains metadata about the book, such as title, author and so on. Currently supported meta elements are:
- `author`
- `language`
- `pages`
- `religion`
- `source`
- `title`

#### author
The `author` element contains information about the author of a book. The `author` element has a mandatory attribute `id` which is globally unique. It also has a child element `name` whose text is a description of the authors name.

#### language
The `language` element contains a two character language code as text, identifying the main language, the book is written in.

#### pages
The `pages` element contains a number as text, which describes the number of pages of the document in it's original published form.

#### religion
The `religion` element contains information about the religion this book is commonly associated with. The `religion` element has a mandatory attribute `id` which is globally unique. It also has a child element `name` whose text is a description of the religions name.

#### source
The `source` element contains one child element `name` that identifies the publisher of the document in it's original published form.

#### title
The `title` element contains the title of the document as text, in the language specified by the corresponding `language` element.

### content
The content element contains the actual text of the book. It can have multiple `section` elements as child elements.

#### section
The `section` element contains the text of one section of the document. It has a `title` attribute denoting the title of the section. It also has one or more `p` elements which define the text paragraphs of this section. Note that at the current version of the specification no nesting of sections is allowed, though this is envisioned for a future version.
