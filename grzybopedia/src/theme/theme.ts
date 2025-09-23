import {createTheme} from '@mui/material'

declare module '@mui/material/styles'{
    interface Palette{
        surface:Palette['primary'];
    }
    interface PaletteOptions{
        surface?:PaletteOptions['primary'];
    }
}
export const theme = createTheme({
    palette:{
        primary:{
            main:'#22c55e',
            contrastText:'#fff',
        },
        secondary:{
            main:'#166534'
        },
        background:{
            default:'#F0FDF4',
            paper:'#fff',
        },
        surface:{
            main:'#DCFCE7',
            contrastText:'#14532D',
        },
        text:{
            primary:'#14532D',
            secondary:'#166534'
        }
    },
    typography:{
        fontFamily:'Roboto,sans-sarif',
        h1:{
            fontWeight:700,
        },
        
    }
})