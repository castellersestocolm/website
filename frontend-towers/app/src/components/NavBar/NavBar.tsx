import * as React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MailIcon from '@mui/icons-material/Mail';
import IconLogoLong from '../IconLogoLong/IconLogoLong.jsx';
import styles from './styles.module.css';
import {Badge, Container, Menu, MenuItem, Typography} from "@mui/material";


const pages = ["Test"];

export default function NavBar() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar
      className={styles.navBar}
      position="static"
    ><Container maxWidth="lg">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignContent: 'start', px: 0 }}>
              <div className={styles.navIcon}><IconLogoLong/></div>
              {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Typography fontWeight={600}>{page}</Typography>
                  </MenuItem>
              ))}
          </Box>
          <Box sx={{display: 'flex', alignItems: 'end', px: 0 }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <IconButton size="large" aria-label="show 2 new messages" color="inherit">
          <Badge badgeContent={2} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
            </Box>
          </Box>
        </Toolbar></Container>
    </AppBar>
  );
}
