const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            © {currentYear} Eza Muhinzi. Uburenganzira bwose burabitswe.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
