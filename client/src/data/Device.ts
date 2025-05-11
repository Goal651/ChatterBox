import { useMediaQuery } from "react-responsive";

export  function MediaType() {
    const device = {
        isDesktop: useMediaQuery({ minWidth: 1024 }),
        isTablet: useMediaQuery({ minWidth: 768, maxWidth: 1023 }),
        isMobile: useMediaQuery({ maxWidth: 767 })
    }
    return device
}