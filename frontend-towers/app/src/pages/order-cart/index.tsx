import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import { useAppContext } from "../../components/AppContext/AppContext";
import Box from "@mui/material/Box";
import {
  Card,
  Divider,
  ListItemButton,
  List,
  ListItemText,
  Typography,
  ListItemIcon,
  Stack,
  Button,
  Link,
  SelectChangeEvent,
  Collapse,
  FormHelperText,
} from "@mui/material";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import {
  apiDataLocationCountryList,
  apiEventList,
  apiOrderCreate,
  apiOrderDelete,
  apiOrderDeliveryProviderList,
} from "../../api";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ChangeEvent, useCallback } from "react";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps,
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import IconArrowForwardIosSharp from "@mui/icons-material/ArrowForwardIosSharp";
import { OrderDeliveryType } from "../../enums";
import { TransitionGroup } from "react-transition-group";
import { capitalizeFirstLetter } from "../../utils/string";
import { amountToString } from "../../utils/money";
import { LoaderClip } from "../../components/LoaderClip/LoaderClip";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<IconArrowForwardIosSharp sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: "rotate(90deg)",
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles("dark", {
    backgroundColor: "rgba(255, 255, 255, .05)",
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

function OrderCartPage() {
  const [t, i18n] = useTranslation("common");

  const { user, cart, setCart, order, setOrder, setMessages } = useAppContext();

  const [events, setEvents] = React.useState(undefined);
  const [allowedCountryCodes, setAllowedCountryCodes] =
    React.useState(undefined);
  const [allowedCountryNames, setAllowedCountryNames] =
    React.useState(undefined);
  const [countries, setCountries] = React.useState(undefined);
  const [regionsByCountryCode, setRegionsByCountryCode] =
    React.useState(undefined);
  const [zoneByCountryCode, setZoneByCountryCode] = React.useState(undefined);
  const [countryByRegionCode, setCountryByRegionCode] =
    React.useState(undefined);
  const [countriesByZoneCode, setCountriesByZoneCode] =
    React.useState(undefined);
  const [formDeliveryData, setFormDeliveryData] = React.useState({
    address: undefined,
    apartment: undefined,
    address2: undefined,
    postcode: undefined,
    city: undefined,
    country: "SWE",
    region: undefined,
  });
  const [formPickupData, setFormPickupData] = React.useState({
    event: undefined,
  });
  const [formUserData, setFormUserData] = React.useState({
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    phone: undefined,
  });
  const [deliveryProviderById, setDeliveryProviderById] =
    React.useState(undefined);
  const [formDeliveryProviderId, setFormDeliveryProviderId] =
    React.useState(undefined);
  const [deliveryPriceById, setDeliveryPriceById] = React.useState(undefined);
  const [deliveryPrice, setDeliveryPrice] = React.useState(undefined);
  const [validationErrors, setValidationErrors] = React.useState(undefined);

  let navigate = useNavigate();

  React.useEffect(() => {
    apiEventList().then((response) => {
      if (response.status === 200) {
        setEvents(response.data);
      }
    });
  }, [setEvents]);

  const handleFormDeliveryData = useCallback(
    (field: string, value: string) => {
      setFormDeliveryData((formDeliveryData: any) => ({
        ...Object.fromEntries(
          Object.entries(formDeliveryData).map(([k, v]: any, i) => [k, v]),
        ),
        [field]: value,
      }));
    },
    [setFormDeliveryData],
  );

  const handleFormPickupData = useCallback(
    (field: string, value: string) => {
      setFormPickupData((formPickupData: any) => ({
        ...Object.fromEntries(
          Object.entries(formPickupData).map(([k, v]: any, i) => [k, v]),
        ),
        [field]: value,
      }));
    },
    [setFormPickupData],
  );

  const handleFormUserData = useCallback(
    (field: string, value: string) => {
      setFormUserData((formUserData: any) => ({
        ...Object.fromEntries(
          Object.entries(formUserData).map(([k, v]: any, i) => [k, v]),
        ),
        [field]: value,
      }));
    },
    [setFormUserData],
  );

  React.useEffect(() => {
    if (!deliveryPriceById || !cart) {
      setDeliveryPrice(undefined);
    } else {
      const weightGrams = Object.values(cart)
        .filter(
          ([quantity, [product, productSize]]: any[]) =>
            product && quantity > 0,
        )
        .map(
          ([quantity, [product, productSize]]: any[]) =>
            quantity * product.weight_grams,
        )
        .reduce((partialSum: number, weight: any) => partialSum + weight, 0);

      const countryCode = formDeliveryData.country
        ? formDeliveryData.country
        : undefined;
      const regionCode = formDeliveryData.region
        ? formDeliveryData.region
        : undefined;
      const zoneCode =
        countryCode && zoneByCountryCode && countryCode in zoneByCountryCode
          ? zoneByCountryCode[countryCode].code
          : undefined;

      const deliveryPrices = Object.entries(deliveryPriceById)
        .filter(
          ([deliveryIds, deliveryPrice]: any) =>
            formDeliveryProviderId === deliveryIds.split(",")[0] &&
            weightGrams <= deliveryPrice.max_grams &&
            (!deliveryPrice.zone || deliveryPrice.zone.code === zoneCode) &&
            (!deliveryPrice.country ||
              deliveryPrice.country.code === countryCode) &&
            (!deliveryPrice.region || deliveryPrice.region.code === regionCode),
        )
        .map(([deliveryIds, deliveryPrice]: any) => deliveryPrice)
        .sort(
          (dp1: any, dp2: any) =>
            (dp1.region === regionCode ? 1 : 0) ||
            (dp1.country === countryCode ? 1 : 0) ||
            (dp1.zone === zoneCode ? 1 : 0) ||
            dp2.amount - dp1.amount,
        );
      setDeliveryPrice(deliveryPrices ? deliveryPrices[0] : undefined);
    }
  }, [
    cart,
    deliveryPriceById,
    zoneByCountryCode,
    setDeliveryPrice,
    formDeliveryData.country,
    formDeliveryData.region,
    formDeliveryProviderId,
  ]);

  React.useEffect(() => {
    if (
      formDeliveryProviderId &&
      formDeliveryProviderId &&
      deliveryProviderById[formDeliveryProviderId]
    ) {
      const allowedCountries = Array.from(
        new Set(
          deliveryProviderById[formDeliveryProviderId].prices
            .map((deliveryPrice: any) =>
              (deliveryPrice.zone &&
              deliveryPrice.zone.code in countriesByZoneCode
                ? countriesByZoneCode[deliveryPrice.zone.code].map(
                    (countryData: any) => countryData.code,
                  )
                : []
              )
                .concat(
                  deliveryPrice.country ? [deliveryPrice.country.code] : [],
                )
                .concat(
                  deliveryPrice.region &&
                    deliveryPrice.region.code in countryByRegionCode
                    ? [countryByRegionCode[deliveryPrice.region.code].code]
                    : [],
                ),
            )
            .flat()
            .filter((countryCode: any) => countryCode),
        ),
      );
      setAllowedCountryCodes(allowedCountries);
      const allowedCountryNames = Array.from(
        new Set(
          deliveryProviderById[formDeliveryProviderId].prices
            .map((deliveryPrice: any) =>
              (deliveryPrice.zone &&
              deliveryPrice.zone.code in countriesByZoneCode
                ? [deliveryPrice.zone.name]
                : []
              )
                .concat(
                  deliveryPrice.country ? [deliveryPrice.country.name] : [],
                )
                .concat(
                  deliveryPrice.region &&
                    deliveryPrice.region.code in countryByRegionCode
                    ? [countryByRegionCode[deliveryPrice.region.code].name]
                    : [],
                ),
            )
            .flat()
            .filter((name: any) => name)
            .sort(),
        ),
      );
      setAllowedCountryNames(allowedCountryNames);
    }
  }, [
    countries,
    countriesByZoneCode,
    countryByRegionCode,
    formDeliveryProviderId,
    deliveryProviderById,
    setAllowedCountryCodes,
    setAllowedCountryNames,
  ]);

  React.useEffect(() => {
    const tmpCartString = localStorage.getItem("cart");
    if (tmpCartString) {
      const tmpCart = JSON.parse(tmpCartString);
      setCart(tmpCart);
    }
  }, [setCart]);

  React.useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart ? cart : ""));
  }, [cart]);

  React.useEffect(() => {
    apiDataLocationCountryList().then((response) => {
      if (response.status === 200) {
        const countries = response.data;
        setCountries(countries);
        setRegionsByCountryCode(
          Object.fromEntries(
            countries
              .filter(
                (countryData: any) =>
                  countryData.regions && countryData.regions.length > 0,
              )
              .map((countryData: any) => [
                countryData.code,
                countryData.regions,
              ]),
          ),
        );
        setCountryByRegionCode({
          ...Object.fromEntries(
            countries
              .map((countryData: any) =>
                countryData.regions.map((regionData: any) => [
                  regionData.code,
                  countryData,
                ]),
              )
              .flat(),
          ),
        });
        setZoneByCountryCode(
          Object.fromEntries(
            countries
              .filter((countryData: any) => countryData.zone)
              .map((countryData: any) => [countryData.code, countryData.zone]),
          ),
        );
        const zoneCodes = Array.from(
          new Set(
            countries
              .filter((countryData: any) => countryData.zone)
              .map((countryData: any) => countryData.zone.code),
          ),
        );
        setCountriesByZoneCode(
          Object.fromEntries(
            zoneCodes.map((zoneCode: string) => [
              zoneCode,
              Array.from(
                new Set(
                  countries
                    .filter(
                      (countryData: any) =>
                        countryData.zone && countryData.zone.code === zoneCode,
                    )
                    .map((countryData: any) => countryData),
                ),
              ),
            ]),
          ),
        );
      }
    });
  }, [
    apiDataLocationCountryList,
    setCountries,
    setRegionsByCountryCode,
    setCountryByRegionCode,
    setZoneByCountryCode,
    setCountriesByZoneCode,
    i18n.resolvedLanguage,
  ]);

  React.useEffect(() => {
    apiOrderDeliveryProviderList().then((response) => {
      if (response.status === 200) {
        const deliveryProviders = response.data;
        setDeliveryProviderById(
          Object.fromEntries(
            deliveryProviders.map((deliveryProvider: any) => [
              deliveryProvider.id,
              deliveryProvider,
            ]),
          ),
        );
        setDeliveryPriceById({
          ...Object.fromEntries(
            deliveryProviders
              .map((deliveryProvider: any) =>
                deliveryProvider.prices.map((deliveryPrice: any) => [
                  [deliveryProvider.id, deliveryPrice.id],
                  deliveryPrice,
                ]),
              )
              .flat(),
          ),
        });
        if (
          !formDeliveryProviderId &&
          deliveryProviders &&
          deliveryProviders.length > 0
        ) {
          setFormDeliveryProviderId(deliveryProviders[0].id);
        }
      }
    });
  }, [
    apiOrderDeliveryProviderList,
    setDeliveryProviderById,
    setFormDeliveryProviderId,
    setDeliveryPriceById,
    i18n.resolvedLanguage,
  ]);

  function handleFormDeliveryProvider(deliveryProviderId: string) {
    const deliveryProvider = deliveryProviderById[deliveryProviderId];
    if (deliveryProvider.is_enabled) {
      setFormDeliveryProviderId(deliveryProviderId);
    }
  }

  function handleEmptyCart() {
    setCart(undefined);
    localStorage.removeItem("cart");
    localStorage.removeItem("orderId");
    localStorage.removeItem("order");
    setMessages([
      { message: t("pages.order-cart.cancel.success"), type: "success" },
    ]);
    setTimeout(() => setMessages(undefined), 5000);
    navigate(ROUTES.order.path);
  }

  React.useEffect(() => {
    const deliveryProvider =
      formDeliveryProviderId && deliveryProviderById[formDeliveryProviderId];
    localStorage.setItem(
      "order",
      JSON.stringify({
        delivery: { provider: deliveryProvider, price: deliveryPrice },
        form: {
          user: formUserData,
          delivery: formDeliveryData,
          pickup: formPickupData,
        },
      }),
    );
  }, [
    formDeliveryProviderId,
    deliveryProviderById,
    formUserData,
    formDeliveryData,
    formPickupData,
  ]);

  function handleProceedPayment() {
    const sizes = Object.values(cart)
      .filter(([quantity, [product, productSize]]: any[]) => quantity > 0)
      .map(([quantity, [product, productSize]]: any[]) => ({
        id: productSize.id,
        quantity: quantity,
      }));
    const deliveryProvider =
      formDeliveryProviderId && deliveryProviderById[formDeliveryProviderId];

    const oldOrderId = localStorage.getItem("orderId");
    if (oldOrderId) {
      apiOrderDelete(oldOrderId);
      localStorage.removeItem("orderId");
      localStorage.removeItem("order");
    }

    apiOrderCreate(
      sizes,
      formDeliveryData,
      deliveryProvider,
      formUserData,
      formPickupData,
    ).then((response) => {
      if (response.status === 201) {
        setValidationErrors(undefined);
        setOrder(response.data);
        localStorage.setItem("orderId", response.data.id);
        localStorage.removeItem("cart");
        navigate(ROUTES["order-payment"].path.replace(":id", response.data.id));
      } else if (response.status === 429) {
        setValidationErrors({ throttle: response.data.detail });
      } else if (response.status === 400) {
        setValidationErrors(response.data);
      } else {
        setMessages([
          { message: t("pages.order-cart.order.error"), type: "error" },
        ]);
        setTimeout(() => setMessages(undefined), 10000);
      }
    });
  }

  const cartAmount =
    (cart &&
      parseInt(
        // @ts-ignore
        Object.values(cart).reduce(
          (partialSum: number, cartItem: any) =>
            partialSum + cartItem[0] * cartItem[1][1].price.amount,
          0,
        ),
      )) ||
    0;

  const cartVatAmount =
    ((cart &&
      parseInt(
        // @ts-ignore
        Object.values(cart).reduce(
          (partialSum: number, cartItem: any) =>
            partialSum + cartItem[0] * cartItem[1][1].price_vat.amount,
          0,
        ),
      )) ||
      0) +
    ((deliveryPrice &&
      // @ts-ignore
      deliveryPrice.price_vat &&
      // @ts-ignore
      deliveryPrice.price_vat.amount) ||
      0);

  // @ts-ignore
  const cartTotalAmount =
    cartAmount + (deliveryPrice ? deliveryPrice.price.amount : 0);

  const cartCurrency =
    (cart &&
      Object.values(cart).length > 0 &&
      // @ts-ignore
      Object.values(cart)[0][1][1].price.currency) ||
    (deliveryPrice &&
      // @ts-ignore
      deliveryPrice.price_vat &&
      // @ts-ignore
      deliveryPrice.price_vat.currency) ||
    "SEK";

  const countriesAllowed =
    countries &&
    countries.filter(
      (country: any) =>
        allowedCountryCodes === undefined ||
        allowedCountryCodes.includes(country.code),
    );

  const hasRegions =
    regionsByCountryCode &&
    "country" in formDeliveryData &&
    formDeliveryData.country in regionsByCountryCode;

  const displayFormAddress =
    formDeliveryProviderId &&
    deliveryProviderById &&
    formDeliveryProviderId in deliveryProviderById &&
    deliveryProviderById[formDeliveryProviderId].type ===
      OrderDeliveryType.DELIVERY;

  const displayFormPickup =
    formDeliveryProviderId &&
    deliveryProviderById &&
    formDeliveryProviderId in deliveryProviderById &&
    deliveryProviderById[formDeliveryProviderId].type ===
      OrderDeliveryType.PICK_UP;

  const hasValidDelivery =
    (deliveryPrice && deliveryPrice.price) ||
    (formDeliveryProviderId &&
      deliveryProviderById[formDeliveryProviderId].type !==
        OrderDeliveryType.DELIVERY);
  const hasValidUser =
    user != null ||
    (formUserData.firstname &&
      formUserData.lastname &&
      formUserData.email &&
      formUserData.phone);
  const hasValidAddress =
    (formDeliveryProviderId &&
      deliveryProviderById[formDeliveryProviderId].type !==
        OrderDeliveryType.DELIVERY) ||
    (formDeliveryData.address &&
      formDeliveryData.postcode &&
      formDeliveryData.city &&
      formDeliveryData.country &&
      (!hasRegions || formDeliveryData.region));
  const hasValidPickup =
    (formDeliveryProviderId &&
      deliveryProviderById[formDeliveryProviderId].type !==
        OrderDeliveryType.PICK_UP) ||
    formPickupData.event;

  const canSubmit =
    cart &&
    Object.keys(cart).length > 0 &&
    hasValidDelivery &&
    hasValidUser &&
    hasValidAddress &&
    hasValidPickup;

  const content = (
    <Grid container spacing={4} className={styles.orderGrid}>
      <Grid container spacing={4} className={styles.productsGrid}>
        <Grid
          size={{ xs: 12, md: cart && Object.keys(cart).length > 0 ? 8 : 12 }}
        >
          <Grid container spacing={4} direction="column">
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.order-cart.products-card.title")}
                </Typography>
              </Box>
              <Divider />

              {cart && Object.keys(cart).length > 0 ? (
                <List className={styles.productsList}>
                  {Object.values(cart)
                    .filter(
                      ([quantity, [product, productSize]]: any[]) =>
                        quantity > 0,
                    )
                    .map(
                      (
                        [quantity, [product, productSize]]: any[],
                        i: number,
                        row: any,
                      ) => {
                        return (
                          <Box key={productSize.id}>
                            <ListItemButton disableTouchRipple dense>
                              <ListItemIcon className={styles.eventCardIcon}>
                                {product.images &&
                                  product.images.length > 0 && (
                                    <img
                                      src={
                                        BACKEND_BASE_URL +
                                        product.images[0].picture
                                      }
                                      alt={product.name}
                                      className={styles.eventCardImage}
                                    />
                                  )}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <>
                                    <Typography variant="body2">
                                      {quantity +
                                        " x " +
                                        product.name +
                                        " — " +
                                        productSize.size}
                                    </Typography>
                                    {quantity > productSize.stock && (
                                      <Typography
                                        variant="body2"
                                        component="span"
                                        color="error"
                                      >
                                        {t(
                                          "pages.order-cart.products-card.stock-none",
                                        )}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                              <Typography
                                variant="body2"
                                component="span"
                                pl={1}
                                style={{ whiteSpace: "nowrap" }}
                              >
                                {amountToString(
                                  quantity * productSize.price.amount,
                                )}{" "}
                                {productSize.price.currency}
                              </Typography>
                            </ListItemButton>
                          </Box>
                        );
                      },
                    )}
                </List>
              ) : (
                <Box className={styles.userDetailsBox}>
                  <Typography variant="body2" component="span">
                    {t("pages.order-cart.products-card.empty")}
                  </Typography>
                </Box>
              )}
            </Card>

            {cart && Object.keys(cart).length > 0 && (
              <Card variant="outlined">
                <Box className={styles.userTopBox}>
                  <Typography variant="h6" fontWeight="600" component="div">
                    {t("pages.order-cart.entity-card.title")}
                  </Typography>
                </Box>
                <Divider />
                <Box className={styles.dataDetailsBox}>
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    mb={2}
                    width="100%"
                  >
                    {t("pages.order-cart.entity-card.contact-info.title")}
                  </Typography>
                  {user != null ? (
                    <>
                      <Typography variant="body1" width="100%">
                        {user.firstname} {user.lastname}
                      </Typography>
                      <Typography variant="body1" width="100%">
                        <Link
                          color="textPrimary"
                          href={"mailto:" + user.email}
                          underline="none"
                        >
                          {user.email}
                        </Link>
                      </Typography>
                      <Typography variant="body1" width="100%">
                        {user.phone}
                      </Typography>
                    </>
                  ) : (
                    <Grid container spacing={3}>
                      <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="firstname" required>
                          {t("pages.user-join.form.first-name")}
                        </FormLabel>
                        <OutlinedInput
                          id="firstname"
                          name="firstname"
                          type="text"
                          placeholder="Namn"
                          autoComplete="first name"
                          required
                          defaultValue={user && user.firstname}
                          disabled={user != null && user.firstname}
                          onChange={(event: ChangeEvent) =>
                            handleFormUserData(
                              "firstname",
                              (event.target as HTMLTextAreaElement).value,
                            )
                          }
                          size="small"
                          error={
                            validationErrors &&
                            validationErrors.user &&
                            validationErrors.user.firstname
                          }
                        />
                        {validationErrors &&
                          validationErrors.user &&
                          validationErrors.user.firstname && (
                            <FormHelperText error>
                              {validationErrors.user.firstname[0].detail}
                            </FormHelperText>
                          )}
                      </FormGrid>
                      <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="lastname" required>
                          {t("pages.user-join.form.last-name")}
                        </FormLabel>
                        <OutlinedInput
                          id="lastname"
                          name="lastname"
                          type="text"
                          placeholder="Namnsson"
                          autoComplete="last name"
                          required
                          defaultValue={user && user.lastname}
                          disabled={user != null && user.lastname}
                          onChange={(event: ChangeEvent) =>
                            handleFormUserData(
                              "lastname",
                              (event.target as HTMLTextAreaElement).value,
                            )
                          }
                          size="small"
                          error={
                            validationErrors &&
                            validationErrors.user &&
                            validationErrors.user.lastname
                          }
                        />
                        {validationErrors &&
                          validationErrors.user &&
                          validationErrors.user.lastname && (
                            <FormHelperText error>
                              {validationErrors.user.lastname[0].detail}
                            </FormHelperText>
                          )}
                      </FormGrid>
                      <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="email" required>
                          {t("pages.user-join.form.email")}
                        </FormLabel>
                        <OutlinedInput
                          id="email"
                          name="email"
                          type="email"
                          placeholder="namn@namnsson.se"
                          autoComplete="email"
                          required
                          defaultValue={user && user.email}
                          disabled={user != null && user.email}
                          onChange={(event: ChangeEvent) =>
                            handleFormUserData(
                              "email",
                              (event.target as HTMLTextAreaElement).value,
                            )
                          }
                          size="small"
                          error={
                            validationErrors &&
                            validationErrors.user &&
                            validationErrors.user.email
                          }
                        />
                        {validationErrors &&
                          validationErrors.user &&
                          validationErrors.user.email && (
                            <FormHelperText error>
                              {validationErrors.user.email[0].detail}
                            </FormHelperText>
                          )}
                      </FormGrid>
                      <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="phone" required>
                          {t("pages.user-join.form.phone")}
                        </FormLabel>
                        <OutlinedInput
                          id="phone"
                          name="phone"
                          type="phone"
                          placeholder="+4687461000"
                          autoComplete="phone"
                          required
                          defaultValue={user && user.phone}
                          disabled={user != null && user.phone}
                          onChange={(event: ChangeEvent) =>
                            handleFormUserData(
                              "phone",
                              (event.target as HTMLTextAreaElement).value,
                            )
                          }
                          size="small"
                          error={
                            validationErrors &&
                            validationErrors.user &&
                            validationErrors.user.phone
                          }
                        />
                        {validationErrors &&
                          validationErrors.user &&
                          validationErrors.user.phone && (
                            <FormHelperText error>
                              {validationErrors.user.phone[0].detail}
                            </FormHelperText>
                          )}
                      </FormGrid>
                    </Grid>
                  )}
                </Box>
                <Divider />
                {deliveryProviderById ? (
                  <>
                    <Box className={styles.dataDetailsBox}>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        mb={2}
                        width="100%"
                      >
                        {t("pages.order-cart.entity-card.delivery-info.title")}
                      </Typography>
                      {deliveryProviderById &&
                        Object.values(deliveryProviderById).map(
                          (deliveryProvider: any) => {
                            return (
                              <Accordion
                                elevation={0}
                                expanded={
                                  formDeliveryProviderId === deliveryProvider.id
                                }
                                onChange={() =>
                                  handleFormDeliveryProvider(
                                    deliveryProvider.id,
                                  )
                                }
                              >
                                <AccordionSummary
                                  aria-controls="panel1d-content"
                                  id="panel1d-header"
                                  disabled={!deliveryProvider.is_enabled}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    component="span"
                                  >
                                    {deliveryProvider.name}
                                  </Typography>
                                </AccordionSummary>
                                {deliveryProvider.is_enabled && (
                                  <AccordionDetails>
                                    <Grid
                                      container
                                      spacing={{ xs: 2, md: 4 }}
                                      className={styles.deliveryGrid}
                                    >
                                      {deliveryProvider.picture &&
                                        deliveryProvider.picture.medium && (
                                          <Grid size={{ xs: 8, md: 3 }}>
                                            <img
                                              src={
                                                BACKEND_BASE_URL +
                                                deliveryProvider.picture.medium
                                              }
                                              alt={deliveryProvider.name}
                                              className={
                                                styles.deliveryCardImage
                                              }
                                            />
                                          </Grid>
                                        )}
                                      {deliveryProvider.description && (
                                        <Grid
                                          size={{
                                            xs: 12,
                                            md:
                                              deliveryProvider.picture &&
                                              deliveryProvider.picture.medium
                                                ? 9
                                                : 12,
                                          }}
                                        >
                                          {" "}
                                          <Typography
                                            variant="body2"
                                            component="span"
                                          >
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html:
                                                  deliveryProvider.description,
                                              }}
                                            />
                                            {deliveryProvider.dates &&
                                              deliveryProvider.dates.length >
                                                0 && (
                                                <>
                                                  <br />
                                                  <strong>
                                                    {t(
                                                      "pages.order-cart.entity-card.delivery-info.date",
                                                    )}
                                                    {": "}
                                                    {capitalizeFirstLetter(
                                                      new Date(
                                                        deliveryProvider.dates[0].date,
                                                      ).toLocaleDateString(
                                                        i18n.resolvedLanguage,
                                                        {
                                                          day: "numeric",
                                                          month: "long",
                                                          year: "numeric",
                                                        },
                                                      ),
                                                    )}
                                                    {"."}
                                                  </strong>
                                                </>
                                              )}
                                            {allowedCountryNames &&
                                              allowedCountryNames.length >
                                                0 && (
                                                <>
                                                  {deliveryProvider.dates &&
                                                    deliveryProvider.dates
                                                      .length > 0 && <br />}
                                                  <br />
                                                  <span>
                                                    {t(
                                                      "pages.order-cart.entity-card.delivery-info.countries-list",
                                                    )}
                                                    {": "}
                                                    {allowedCountryNames.join(
                                                      ", ",
                                                    )}
                                                    {". "}
                                                    {t(
                                                      "pages.order-cart.entity-card.delivery-info.countries-reason",
                                                    )}
                                                  </span>
                                                </>
                                              )}
                                          </Typography>
                                        </Grid>
                                      )}
                                    </Grid>
                                  </AccordionDetails>
                                )}
                              </Accordion>
                            );
                          },
                        )}
                    </Box>
                    <TransitionGroup>
                      {cart &&
                        Object.keys(cart).length > 0 &&
                        displayFormAddress && (
                          <Collapse in={displayFormAddress}>
                            <Divider />
                            <Box className={styles.dataDetailsBox}>
                              <Typography
                                variant="body1"
                                fontWeight={700}
                                mb={2}
                                width="100%"
                              >
                                {t(
                                  "pages.order-cart.entity-card.address-info.title",
                                )}
                              </Typography>
                              <Grid container spacing={3}>
                                <FormGrid size={8}>
                                  <FormLabel htmlFor="address" required>
                                    {t("pages.order-cart.form.street")}
                                  </FormLabel>
                                  <OutlinedInput
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder="Drottninggatan 1"
                                    autoComplete="address"
                                    required
                                    size="small"
                                    onChange={(event: ChangeEvent) =>
                                      handleFormDeliveryData(
                                        "address",
                                        (event.target as HTMLTextAreaElement)
                                          .value,
                                      )
                                    }
                                    error={
                                      validationErrors &&
                                      validationErrors.delivery &&
                                      validationErrors.delivery.address &&
                                      validationErrors.delivery.address.address
                                    }
                                  />
                                  {validationErrors &&
                                    validationErrors.delivery &&
                                    validationErrors.delivery.address &&
                                    validationErrors.delivery.address
                                      .address && (
                                      <FormHelperText error>
                                        {
                                          validationErrors.delivery.address
                                            .address[0].detail
                                        }
                                      </FormHelperText>
                                    )}
                                </FormGrid>
                                <FormGrid size={4}>
                                  <FormLabel htmlFor="apartment">
                                    {t("pages.order-cart.form.apartment")}
                                  </FormLabel>
                                  <OutlinedInput
                                    id="apartment"
                                    name="apartment"
                                    type="text"
                                    placeholder="1001"
                                    autoComplete="apartment"
                                    size="small"
                                    onChange={(event: ChangeEvent) =>
                                      handleFormDeliveryData(
                                        "apartment",
                                        (event.target as HTMLTextAreaElement)
                                          .value,
                                      )
                                    }
                                    error={
                                      validationErrors &&
                                      validationErrors.delivery &&
                                      validationErrors.delivery.address &&
                                      validationErrors.delivery.address
                                        .apartment
                                    }
                                  />
                                  {validationErrors &&
                                    validationErrors.delivery &&
                                    validationErrors.delivery.address &&
                                    validationErrors.delivery.address
                                      .apartment && (
                                      <FormHelperText error>
                                        {
                                          validationErrors.delivery.address
                                            .apartment[0].detail
                                        }
                                      </FormHelperText>
                                    )}
                                </FormGrid>
                                <FormGrid size={12}>
                                  <FormLabel htmlFor="address2">
                                    {t("pages.order-cart.form.street2")}
                                  </FormLabel>
                                  <OutlinedInput
                                    id="address2"
                                    name="address2"
                                    type="text"
                                    autoComplete="address2"
                                    size="small"
                                    onChange={(event: ChangeEvent) =>
                                      handleFormDeliveryData(
                                        "address2",
                                        (event.target as HTMLTextAreaElement)
                                          .value,
                                      )
                                    }
                                    error={
                                      validationErrors &&
                                      validationErrors.delivery &&
                                      validationErrors.delivery.address &&
                                      validationErrors.delivery.address.address2
                                    }
                                  />
                                  {validationErrors &&
                                    validationErrors.delivery &&
                                    validationErrors.delivery.address &&
                                    validationErrors.delivery.address
                                      .address2 && (
                                      <FormHelperText error>
                                        {
                                          validationErrors.delivery.address
                                            .address2[0].detail
                                        }
                                      </FormHelperText>
                                    )}
                                </FormGrid>
                                <FormGrid size={{ xs: 12, md: 4 }}>
                                  <FormLabel htmlFor="postcode" required>
                                    {t("pages.order-cart.form.postcode")}
                                  </FormLabel>
                                  <OutlinedInput
                                    id="postcode"
                                    name="postcode"
                                    type="text"
                                    placeholder="123 45"
                                    autoComplete="postcode"
                                    required
                                    onChange={(event: ChangeEvent) =>
                                      handleFormDeliveryData(
                                        "postcode",
                                        (event.target as HTMLTextAreaElement)
                                          .value,
                                      )
                                    }
                                    size="small"
                                    error={
                                      validationErrors &&
                                      validationErrors.delivery &&
                                      validationErrors.delivery.address &&
                                      validationErrors.delivery.address.postcode
                                    }
                                  />
                                  {validationErrors &&
                                    validationErrors.delivery &&
                                    validationErrors.delivery.address &&
                                    validationErrors.delivery.address
                                      .postcode && (
                                      <FormHelperText error>
                                        {
                                          validationErrors.delivery.address
                                            .postcode[0].detail
                                        }
                                      </FormHelperText>
                                    )}
                                </FormGrid>
                                <FormGrid size={{ xs: 12, md: 8 }}>
                                  <FormLabel htmlFor="city" required>
                                    {t("pages.order-cart.form.city")}
                                  </FormLabel>
                                  <OutlinedInput
                                    id="city"
                                    name="city"
                                    type="text"
                                    placeholder="Stockholm"
                                    autoComplete="city"
                                    required
                                    onChange={(event: ChangeEvent) =>
                                      handleFormDeliveryData(
                                        "city",
                                        (event.target as HTMLTextAreaElement)
                                          .value,
                                      )
                                    }
                                    size="small"
                                    error={
                                      validationErrors &&
                                      validationErrors.delivery &&
                                      validationErrors.delivery.address &&
                                      validationErrors.delivery.address.city
                                    }
                                  />
                                  {validationErrors &&
                                    validationErrors.delivery &&
                                    validationErrors.delivery.address &&
                                    validationErrors.delivery.address.city && (
                                      <FormHelperText error>
                                        {
                                          validationErrors.delivery.address
                                            .city[0].detail
                                        }
                                      </FormHelperText>
                                    )}
                                </FormGrid>

                                <FormGrid
                                  size={hasRegions ? { xs: 12, md: 6 } : 12}
                                >
                                  <FormLabel
                                    id="label-country"
                                    htmlFor="country"
                                    required
                                  >
                                    {t("pages.order-cart.form.country")}
                                  </FormLabel>
                                  <Select
                                    size="small"
                                    labelId="label-country"
                                    id="country"
                                    input={
                                      <OutlinedInput
                                        label={t(
                                          "pages.order-cart.form.country",
                                        )}
                                      />
                                    }
                                    onChange={(event: SelectChangeEvent) =>
                                      handleFormDeliveryData(
                                        "country",
                                        event.target.value,
                                      )
                                    }
                                    defaultValue={formDeliveryData.country}
                                    MenuProps={MenuProps}
                                    variant="standard"
                                  >
                                    {countriesAllowed &&
                                      countriesAllowed.length > 0 &&
                                      countriesAllowed.map(
                                        (country: any, i: number) => {
                                          return (
                                            <MenuItem
                                              key={i}
                                              value={country.code}
                                            >
                                              {country.name}
                                            </MenuItem>
                                          );
                                        },
                                      )}
                                  </Select>
                                </FormGrid>
                                {hasRegions && (
                                  <FormGrid size={{ xs: 12, md: 6 }}>
                                    <FormLabel
                                      id="label-region"
                                      htmlFor="region"
                                      required
                                    >
                                      {t("pages.order-cart.form.region")}
                                    </FormLabel>
                                    <Select
                                      size="small"
                                      labelId="label-region"
                                      id="region"
                                      input={
                                        <OutlinedInput
                                          label={t(
                                            "pages.order-cart.form.region",
                                          )}
                                        />
                                      }
                                      onChange={(event: SelectChangeEvent) =>
                                        handleFormDeliveryData(
                                          "region",
                                          event.target.value,
                                        )
                                      }
                                      defaultValue={formDeliveryData.region}
                                      MenuProps={MenuProps}
                                      variant="standard"
                                    >
                                      {hasRegions &&
                                        regionsByCountryCode[
                                          formDeliveryData.country
                                        ].map((region: any, i: number) => {
                                          return (
                                            <MenuItem
                                              key={i}
                                              value={region.code}
                                            >
                                              {region.name}
                                            </MenuItem>
                                          );
                                        })}
                                    </Select>
                                  </FormGrid>
                                )}
                              </Grid>
                            </Box>
                          </Collapse>
                        )}
                    </TransitionGroup>
                    <TransitionGroup>
                      {cart &&
                        Object.keys(cart).length > 0 &&
                        displayFormPickup && (
                          <Collapse in={displayFormPickup}>
                            <Divider />
                            <Box className={styles.dataDetailsBox}>
                              <Typography
                                variant="body1"
                                fontWeight={700}
                                mb={2}
                                width="100%"
                              >
                                {t(
                                  "pages.order-cart.entity-card.pickup-info.title",
                                )}
                              </Typography>
                              <Grid container spacing={3}>
                                <FormGrid size={12}>
                                  <FormLabel
                                    id="label-event"
                                    htmlFor="event"
                                    required
                                  >
                                    {t("pages.order-cart.form.event")}
                                  </FormLabel>
                                  <Select
                                    size="small"
                                    labelId="label-date"
                                    id="event"
                                    input={
                                      <OutlinedInput
                                        label={t("pages.order-cart.form.event")}
                                      />
                                    }
                                    onChange={(event: SelectChangeEvent) =>
                                      handleFormPickupData(
                                        "event",
                                        event.target.value,
                                      )
                                    }
                                    defaultValue={formPickupData.event}
                                    MenuProps={MenuProps}
                                    variant="standard"
                                  >
                                    {events &&
                                      events.results &&
                                      events.results.length > 0 &&
                                      events.results.map(
                                        (event: any, i: number) => {
                                          return (
                                            <MenuItem key={i} value={event.id}>
                                              {event.title +
                                                " — " +
                                                capitalizeFirstLetter(
                                                  new Date(event.time_from)
                                                    .toISOString()
                                                    .slice(0, 10),
                                                ) +
                                                " " +
                                                new Date(event.time_from)
                                                  .toTimeString()
                                                  .slice(0, 5)}
                                            </MenuItem>
                                          );
                                        },
                                      )}
                                  </Select>
                                </FormGrid>
                              </Grid>
                            </Box>
                          </Collapse>
                        )}
                    </TransitionGroup>
                  </>
                ) : (
                  <Box className={styles.loader}>
                    <LoaderClip />
                  </Box>
                )}
              </Card>
            )}
          </Grid>
        </Grid>

        {cart && Object.keys(cart).length > 0 ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.order-cart.summary-card.title")}
                </Typography>
              </Box>
              <Divider />
              <List className={styles.productsList}>
                <Box>
                  <ListItemButton disableTouchRipple dense>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          component="span"
                        >
                          {t("pages.order-cart.summary-card.subtotal")}
                        </Typography>
                      }
                    />
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      component="span"
                      className={styles.productAmount}
                    >
                      {amountToString(cartAmount)} {cartCurrency}
                    </Typography>
                  </ListItemButton>
                </Box>
                <Box>
                  <ListItemButton disableTouchRipple dense>
                    <ListItemText
                      primary={t("pages.order-cart.summary-card.shipping")}
                      secondary={
                        !hasValidDelivery &&
                        t("pages.order-cart.summary-card.shipping.invalid")
                      }
                    />
                    <Typography
                      variant="body2"
                      component="span"
                      className={styles.productAmount}
                    >
                      {
                        // @ts-ignore
                        deliveryPrice && deliveryPrice.price
                          ? // @ts-ignore
                            amountToString(deliveryPrice.price.amount) +
                            " " +
                            // @ts-ignore
                            deliveryPrice.price.currency
                          : (formDeliveryProviderId &&
                            deliveryProviderById[formDeliveryProviderId]
                              .type === OrderDeliveryType.DELIVERY
                              ? "—"
                              : "0") +
                            " " +
                            cartCurrency
                      }
                    </Typography>
                  </ListItemButton>
                </Box>
                <Box>
                  <ListItemButton disableTouchRipple dense>
                    <ListItemText
                      primary={t("pages.order-cart.summary-card.taxes")}
                    />
                    <Typography variant="body2" component="span">
                      {hasValidDelivery ? amountToString(cartVatAmount) : "—"}{" "}
                      {cartCurrency}
                    </Typography>
                  </ListItemButton>
                </Box>
                <Box>
                  <ListItemButton disableTouchRipple dense>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          component="span"
                          className={styles.productAmount}
                        >
                          {t("pages.order-cart.summary-card.total")}
                        </Typography>
                      }
                    />
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      component="span"
                    >
                      {hasValidDelivery ? amountToString(cartTotalAmount) : "—"}{" "}
                      {cartCurrency}
                    </Typography>
                  </ListItemButton>
                </Box>
              </List>
              <Divider />
              <Box className={styles.summaryDetailsBox}>
                <Stack
                  direction="column"
                  spacing={2}
                  className={styles.buttons}
                >
                  <Button
                    variant="contained"
                    type="button"
                    color="primary"
                    disableElevation
                    className={styles.productAmount}
                    onClick={handleProceedPayment}
                    disabled={!canSubmit}
                  >
                    {t("pages.order-cart.summary-card.order")}
                  </Button>
                  <Stack
                    direction="row"
                    spacing={2}
                    className={styles.buttonsFill}
                  >
                    <Button
                      variant="contained"
                      type="button"
                      color="secondary"
                      disableElevation
                      href={ROUTES.order.path}
                    >
                      {t("pages.order.product-card.change")}
                    </Button>
                    <Button
                      variant="contained"
                      type="button"
                      name="delete"
                      color="error"
                      disableElevation
                      onClick={handleEmptyCart}
                      disabled={!cart || Object.keys(cart).length === 0}
                    >
                      {t("pages.order.product-card.empty")}
                    </Button>
                  </Stack>
                  {validationErrors && validationErrors.throttle && (
                    <FormGrid size={{ xs: 12 }}>
                      <FormHelperText error className={styles.error}>
                        {validationErrors.throttle}
                      </FormHelperText>
                    </FormGrid>
                  )}
                </Stack>
              </Box>
            </Card>
          </Grid>
        ) : undefined}
      </Grid>
    </Grid>
  );

  return (
    <PageBase
      title={t("pages.order-cart.title")}
      content={content}
      loading={cart == null}
    />
  );
}

export default OrderCartPage;
