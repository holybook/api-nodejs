<?xml version='1.0' encoding='UTF-8'?>
<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>
  <xsl:output indent="no" omit-xml-declaration="yes" method="text" encoding="utf-8"/>
    <xsl:template match="/book">

        <xsl:text>{ "index" : { "_index" : "en", "_type" : "book", "_id" : "</xsl:text>
        <xsl:value-of select="/book/@id"/>
        <xsl:text>" } }&#10;</xsl:text>

        <xsl:text>{ "title" : "</xsl:text>
        <xsl:value-of select="/book/meta/title"/>
        <xsl:text>", "source" : { "name" : "</xsl:text>
        <xsl:value-of select="/book/meta/source/name"/>
        <xsl:text>" }, "pages" : </xsl:text>
        <xsl:value-of select="/book/meta/pages"/>
        <xsl:text>, "paragraphs" : </xsl:text>
        <xsl:value-of select="count(//p)" />
        <xsl:text>, "author" : { "id" : "</xsl:text>
        <xsl:value-of select="/book/meta/author/@id"/>
        <xsl:text>", "name" : "</xsl:text><xsl:value-of select="/book/meta/author/name"/>
        <xsl:text>" }, "religion" : { "id" : "</xsl:text>
        <xsl:value-of select="/book/meta/religion/@id"/>
        <xsl:text>", "name" : "</xsl:text>
        <xsl:value-of select="/book/meta/religion/name"/>
        <xsl:text>" }, "sections" : [ </xsl:text>
        <xsl:for-each select="content/section[1]">
            <xsl:text>{ "title" : "</xsl:text>
            <xsl:value-of select="@title"/>
            <xsl:text>", "start" : </xsl:text>
            <xsl:value-of select="count(preceding::p)"/>
            <xsl:text> }</xsl:text>
        </xsl:for-each>
        <xsl:for-each select="content/section[position()>1]">
            <xsl:text>, { "title" : "</xsl:text>
            <xsl:value-of select="@title"/>
            <xsl:text>", "start" : </xsl:text>
            <xsl:value-of select="count(preceding::p)"/>
            <xsl:text> }</xsl:text>
        </xsl:for-each>
        <xsl:text> ] }&#10;</xsl:text>

        <xsl:for-each select="content/section/p">

            <xsl:text>{ "index" : { "_index" : "en" , "_type" : "paragraph", "_id" : "</xsl:text>
            <xsl:value-of select="/book/@id"/>#<xsl:value-of select="position() - 1" />
            <xsl:text>" } }&#10;</xsl:text>

            <xsl:text>{ "author" : { "id" : "</xsl:text>
            <xsl:value-of select="/book/meta/author/@id"/>
            <xsl:text>", "name" : "</xsl:text><xsl:value-of select="/book/meta/author/name"/>
            <xsl:text>" }, "book" : { "id" : "</xsl:text>
            <xsl:value-of select="/book/@id"/>
            <xsl:text>", "title" : "</xsl:text>
            <xsl:value-of select="/book/meta/title"/>
            <xsl:text>", "section" : { "title" : "</xsl:text>
            <xsl:value-of select="../@title"/>
            <xsl:text>", "index" : </xsl:text>
            <xsl:value-of select="count(../preceding-sibling::section)" />
            <xsl:text> } }, "religion" : { "id" : "</xsl:text>
            <xsl:value-of select="/book/meta/religion/@id"/>
            <xsl:text>", "name" : "</xsl:text>
            <xsl:value-of select="/book/meta/religion/name"/>
            <xsl:text>" }, "index" : </xsl:text>
            <xsl:value-of select="position() - 1"/>
            <xsl:text>, "text" : "</xsl:text><xsl:value-of select="."/>
            <xsl:text>" }&#10;</xsl:text>

        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>