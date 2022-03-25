import Document, { Html, Head, Main, NextScript } from 'next/document'

class ExtendedDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)
        return initialProps
    }
    render(): JSX.Element {
        return (
            <Html lang='ru'>
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
export default ExtendedDocument