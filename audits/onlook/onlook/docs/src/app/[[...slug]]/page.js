"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Page;
exports.generateStaticParams = generateStaticParams;
exports.generateMetadata = generateMetadata;
const source_1 = require("@/lib/source");
const mdx_components_1 = require("@/mdx-components");
const mdx_1 = require("fumadocs-ui/mdx");
const page_1 = require("fumadocs-ui/page");
const navigation_1 = require("next/navigation");
const edit_gh_1 = require("./edit-gh");
async function Page(props) {
    const params = await props.params;
    const page = source_1.source.getPage(params.slug);
    if (!page)
        (0, navigation_1.notFound)();
    const MDXContent = page.data.body;
    const filePath = params.slug ? `${params.slug.join('/')}.mdx` : 'index.mdx';
    return (<page_1.DocsPage toc={page.data.toc} full={page.data.full}>
            <page_1.DocsBody>
                <MDXContent components={(0, mdx_components_1.getMDXComponents)({
            // this allows you to link to other pages with relative file paths
            a: (0, mdx_1.createRelativeLink)(source_1.source, page),
        })}/>
            </page_1.DocsBody>
            <edit_gh_1.EditGitHub filePath={filePath}/>
        </page_1.DocsPage>);
}
async function generateStaticParams() {
    return source_1.source.generateParams();
}
async function generateMetadata(props) {
    const params = await props.params;
    const page = source_1.source.getPage(params.slug);
    if (!page)
        (0, navigation_1.notFound)();
    // Compute OG image URL at /docs-og/…/image.png
    const image = ['/docs-og', ...(params.slug ?? []), 'image.png'].join('/');
    return {
        title: page.data.title,
        description: page.data.description,
        openGraph: {
            images: image,
        },
        twitter: {
            card: 'summary_large_image',
            images: image,
        },
    };
}
//# sourceMappingURL=page.js.map