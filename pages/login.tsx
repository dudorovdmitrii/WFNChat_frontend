import { Login } from "../components"
import { WithLayout } from "../layout/Layout"

const LoginPage = (): JSX.Element => {
    return (
        <Login />
    )
}
export default WithLayout(LoginPage)